import { useEffect, useRef, useState, ChangeEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Flex,
  Heading,
  Text,
  Input,
  Select,
  Button,
} from "@chakra-ui/react";
import { PublicHeader } from "@/src/components/publicHeader";
import { BookingCalendar } from "@/src/components/bookingCalendar";
import { setupAPIClient } from "@/src/services/api";
import { GetServerSideProps } from "next";
import { AxiosError } from "axios";
import {
  addShopDays,
  formatShopDateTime,
  formatShopTime,
  shopTodayInput,
  shopWeekday,
  toShopDateInput,
} from "@/src/utils/shopTime";
import { saveLastShop } from "@/src/utils/lastShop";
import {
  customerAuthHeaders,
  clearCustomerAccess,
  readCustomerAccess,
  saveCustomerAccess,
} from "@/src/utils/customerAccess";

interface HaircutItem {
  id: string;
  name: string;
  price: number;
}

interface ShopHour {
  weekday: number;
  closed: boolean;
  opens_at: string | null;
  closes_at: string | null;
}

interface ShopData {
  name: string;
  slug: string;
  endereco: string | null;
  slot_interval_minutes: number;
  haircuts: HaircutItem[];
  businessHours: ShopHour[];
}

interface SlotItem {
  at: string;
  status: "available" | "occupied" | "past";
}

interface CustomerSchedule {
  id: string;
  scheduled_at: string;
  haircut: HaircutItem;
}

interface AgendarShopProps {
  shop: ShopData;
}

const WEEKDAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

function todayInput() {
  return shopTodayInput();
}

function nextOpenDate(closedWeekdays: number[]) {
  const today = shopTodayInput();

  for (let offset = 0; offset < 14; offset += 1) {
    const date = addShopDays(today, offset);
    if (!closedWeekdays.includes(shopWeekday(date))) {
      return date;
    }
  }

  return today;
}

function toDateInput(value: string) {
  return toShopDateInput(value);
}

function slotTime(value: string) {
  const date = new Date(value);
  date.setSeconds(0, 0);
  return date.getTime();
}

function formatSlot(value: string) {
  return formatShopTime(value);
}

function formatDateTime(value: string) {
  return formatShopDateTime(value);
}

function formatPrice(value: number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getApiError(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ error?: string }>;
  return axiosError.response?.data?.error || fallback;
}

function normalizePublicSlots(data: unknown): {
  closed: boolean;
  slots: SlotItem[];
} {
  if (Array.isArray(data)) {
    return {
      closed: false,
      slots: data.map((item) =>
        typeof item === "string"
          ? { at: item, status: "available" as const }
          : {
              at: String(item?.at || ""),
              status: item?.status || "available",
            }
      ),
    };
  }

  const payload = data as { closed?: boolean; slots?: unknown[] } | null;
  const rawSlots = Array.isArray(payload?.slots) ? payload.slots : [];

  return {
    closed: Boolean(payload?.closed),
    slots: rawSlots.map((item) =>
      typeof item === "string"
        ? { at: item, status: "available" as const }
        : {
            at: String((item as SlotItem)?.at || ""),
            status: (item as SlotItem)?.status || "available",
          }
    ),
  };
}

export default function AgendarShop({ shop }: AgendarShopProps) {
  const router = useRouter();
  const [shopData, setShopData] = useState(shop);
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [knownCustomer, setKnownCustomer] = useState(false);
  const [accessing, setAccessing] = useState(false);
  const [mySchedules, setMySchedules] = useState<CustomerSchedule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [haircutId, setHaircutId] = useState(shop.haircuts[0]?.id || "");
  const closedWeekdays = shopData.businessHours
    .filter((hour) => hour.closed)
    .map((hour) => hour.weekday);
  const [date, setDate] = useState(() => nextOpenDate(closedWeekdays));
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [dayClosed, setDayClosed] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [slotsNonce, setSlotsNonce] = useState(0);
  const [done, setDone] = useState<{
    scheduled_at: string;
    haircut: HaircutItem;
    updated?: boolean;
  } | null>(null);
  const selectedSlotRef = useRef("");
  const editingIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function loadShop() {
      try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get(`/public/shops/${shop.slug}`);
        if (response.data) {
          setShopData(response.data);
          setHaircutId((current) => current || response.data.haircuts?.[0]?.id || "");
        }
      } catch {
        setShopData(shop);
      }
    }

    loadShop();
  }, [shop]);

  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  function persistAccess(token: string, name: string, currentPhone: string) {
    if (!token || !name || !currentPhone) {
      return;
    }

    setAccessToken(token);
    setCustomer(name);
    setPhone(currentPhone);
    setKnownCustomer(true);
    saveCustomerAccess(shop.slug, {
      token,
      name,
      phone: currentPhone,
    });
  }

  function leaveAccess() {
    clearCustomerAccess(shop.slug);
    setAccessToken("");
    setKnownCustomer(false);
    setMySchedules([]);
    setEditingId(null);
    setCustomer("");
    setPhone("");
  }

  async function loadOwnSchedules(token: string) {
    const apiClient = setupAPIClient();
    const response = await apiClient.get("/public/customer/schedules", {
      params: { slug: shop.slug },
      headers: customerAuthHeaders(token),
    });
    setMySchedules(
      Array.isArray(response.data?.schedules) ? response.data.schedules : []
    );
  }

  useEffect(() => {
    const saved = readCustomerAccess(shop.slug);

    if (!saved) {
      return;
    }

    let cancelled = false;

    async function restore() {
      try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get("/public/customer/schedules", {
          params: { slug: shop.slug },
          headers: customerAuthHeaders(saved.token),
        });

        if (cancelled) {
          return;
        }

        persistAccess(saved.token, saved.name, saved.phone);
        setMySchedules(
          Array.isArray(response.data?.schedules) ? response.data.schedules : []
        );
      } catch {
        if (!cancelled) {
          leaveAccess();
        }
      }
    }

    restore();

    return () => {
      cancelled = true;
    };
    // só restaura o acesso salvo nesta barbearia ao abrir a página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop.slug]);

  useEffect(() => {
    async function loadSlots() {
      if (!date) {
        return;
      }

      const keepSlot = selectedSlotRef.current;
      setLoadingSlots(true);
      setSlotError("");

      try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get(`/public/shops/${shop.slug}/slots`, {
          params: {
            date,
            ignore_schedule_id: editingIdRef.current || undefined,
          },
        });
        const parsed = normalizePublicSlots(response.data);
        setDayClosed(parsed.closed);
        setSlots(parsed.slots.filter((slot) => slot.at));
        const stillThere = parsed.slots.some(
          (slot) => keepSlot && slotTime(slot.at) === slotTime(keepSlot)
        );
        setSelectedSlot(stillThere ? keepSlot : "");
      } catch {
        setDayClosed(false);
        setSlots([]);
        setSelectedSlot("");
        setSlotError("Não foi possível carregar os horários. Tente outro dia.");
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [date, shop.slug, editingId, slotsNonce]);

  async function handleAccess() {
    if (!phone || !customer) {
      alert("Informe telefone e nome para acessar seus horários");
      return;
    }

    setAccessing(true);

    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.post("/public/customer/access", {
        slug: shop.slug,
        phone,
        name: customer,
      });

      if (!response.data?.exists || !response.data?.token) {
        setKnownCustomer(false);
        setMySchedules([]);
        alert(
          "Ainda não há cadastro com esses dados nesta barbearia. Confirme um horário para criar o seu acesso."
        );
        return;
      }

      persistAccess(response.data.token, response.data.name, phone);
      setMySchedules(
        Array.isArray(response.data?.schedules) ? response.data.schedules : []
      );
    } catch (err) {
      setKnownCustomer(false);
      setMySchedules([]);
      alert(getApiError(err, "Não foi possível acessar seus horários"));
    } finally {
      setAccessing(false);
    }
  }

  function resetBookingForm() {
    setEditingId(null);
    setSelectedSlot("");
    setHaircutId(shopData.haircuts[0]?.id || "");
    setDate(nextOpenDate(closedWeekdays));
  }

  function handleEdit(schedule: CustomerSchedule) {
    setEditingId(schedule.id);
    setHaircutId(schedule.haircut.id);
    setDate(toDateInput(schedule.scheduled_at));
    setSelectedSlot(schedule.scheduled_at);
    selectedSlotRef.current = schedule.scheduled_at;
  }

  async function handleCancel(schedule: CustomerSchedule) {
    const confirmed = window.confirm(
      `Cancelar o horário de ${formatDateTime(schedule.scheduled_at)}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const apiClient = setupAPIClient();
      if (!accessToken) {
        alert("Acesse seus horários com telefone e nome para cancelar");
        return;
      }

      await apiClient.delete("/public/schedules", {
        data: {
          slug: shop.slug,
          schedule_id: schedule.id,
        },
        headers: customerAuthHeaders(accessToken),
      });

      if (editingId === schedule.id) {
        resetBookingForm();
      }

      await loadOwnSchedules(accessToken);
      setSlotsNonce((current) => current + 1);
      alert("Agendamento cancelado");
    } catch (err) {
      alert(getApiError(err, "Erro ao cancelar"));
    }
  }

  async function handleSubmit() {
    if (!customer || !phone || !haircutId || !selectedSlot) {
      alert("Preencha nome, telefone, corte e um horário livre");
      return;
    }

    if (editingId && !accessToken) {
      alert("Acesse seus horários com telefone e nome para alterar");
      return;
    }

    setSaving(true);

    try {
      const apiClient = setupAPIClient();
      const payload = {
        slug: shop.slug,
        customer,
        phone,
        haircut_id: haircutId,
        scheduled_at: selectedSlot,
        schedule_id: editingId || undefined,
      };
      const response = editingId
        ? await apiClient.put("/public/schedules", payload, {
            headers: customerAuthHeaders(accessToken),
          })
        : await apiClient.post("/public/schedules", payload);

      const nextToken = response.data.access_token || accessToken;
      persistAccess(nextToken, customer, phone);
      setDone({
        scheduled_at: response.data.scheduled_at,
        haircut: response.data.haircut,
        updated: Boolean(editingId),
      });
      setEditingId(null);
      saveLastShop({ slug: shop.slug, name: shop.name });
      if (nextToken) {
        await loadOwnSchedules(nextToken);
      }
    } catch (err) {
      alert(getApiError(err, editingId ? "Erro ao alterar" : "Erro ao agendar"));
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <>
        <Head>
        <title>{`Agendamento enviado - ${shop.name}`}</title>
        </Head>
        <Flex direction="column" minH="100vh" bg="barber.900" px={4} pb={10}>
          <PublicHeader />
          <Flex
            direction="column"
            w="100%"
            maxW="700px"
            mx="auto"
            bg="barber.400"
            p={8}
            rounded={8}
          >
            <Heading color="orange.900" mb={4} fontSize="2xl">
              {done.updated
                ? "Agendamento atualizado"
                : "Agendamento confirmado"}
            </Heading>
            <Text color="white" mb={2}>
              {customer}, este acesso é só seu em {shop.name}. Outros clientes
              não veem os seus horários.
            </Text>
            <Text color="gray.300" mb={2}>
              Corte: {done.haircut.name}
            </Text>
            <Text color="gray.300" mb={6}>
              Data e horário: {formatDateTime(done.scheduled_at)}
            </Text>
            <Button
              bg="button.cta"
              color="gray.900"
              mb={3}
              onClick={() => {
                setDone(null);
                resetBookingForm();
              }}
            >
              Gerenciar meus horários
            </Button>
            <Button
              variant="outline"
              color="white"
              borderColor="gray.600"
              onClick={() => router.push("/agendar")}
            >
              Escolher outra barbearia
            </Button>
          </Flex>
        </Flex>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`Agendar em ${shop.name} - BarberPro`}</title>
      </Head>
      <Flex direction="column" minH="100vh" bg="barber.900" px={4} pb={10}>
        <PublicHeader />
        <Flex direction="column" w="100%" maxW="700px" mx="auto">
          <Heading color="orange.900" mb={2} fontSize="3xl">
            {shop.name}
          </Heading>
          <Text color="gray.400" mb={6}>
            {shop.endereco || "Endereço não informado"}
          </Text>

          {shopData.haircuts.length === 0 ? (
            <Text color="gray.400">
              Esta barbearia ainda não cadastrou cortes para agendar.
            </Text>
          ) : (
            <Flex
              direction="column"
              bg="barber.400"
              p={8}
              rounded={8}
              align="center"
            >
              <Input
                placeholder="Seu telefone"
                w="85%"
                mb={3}
                size="lg"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                bg="barber.900"
                color="white"
                borderColor="gray.700"
                value={phone}
                isReadOnly={knownCustomer}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPhone(e.target.value);
                  setEditingId(null);
                  setMySchedules([]);
                  setKnownCustomer(false);
                  setAccessToken("");
                }}
              />

              <Input
                placeholder="Seu nome"
                w="85%"
                mb={3}
                size="lg"
                bg="barber.900"
                color="white"
                borderColor="gray.700"
                value={customer}
                isReadOnly={knownCustomer}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCustomer(e.target.value)
                }
              />

              {knownCustomer ? (
                <Flex
                  w="85%"
                  mb={3}
                  direction={{ base: "column", sm: "row" }}
                  align={{ base: "flex-start", sm: "center" }}
                  justify="space-between"
                  gap={2}
                >
                  <Text color="green.300" fontSize="sm">
                    Acesso só seu nesta barbearia. Ninguém vê a agenda de outro
                    cliente.
                  </Text>
                  <Button
                    size="sm"
                    variant="ghost"
                    color="gray.400"
                    onClick={leaveAccess}
                  >
                    Sair do meu acesso
                  </Button>
                </Flex>
              ) : (
                <>
                  <Text w="85%" mb={3} color="gray.400" fontSize="sm">
                    Telefone e nome abrem só os seus horários nesta casa. Horários
                    ocupados aparecem sem o nome de outros clientes.
                  </Text>
                  <Button
                    w="85%"
                    mb={4}
                    size="md"
                    variant="outline"
                    color="white"
                    borderColor="gray.600"
                    isLoading={accessing}
                    onClick={handleAccess}
                  >
                    Acessar meus horários
                  </Button>
                </>
              )}

              {knownCustomer && mySchedules.length > 0 && (
                <Flex w="85%" mb={4} direction="column">
                  <Text mb={2} color="gray.300" fontWeight="bold">
                    Seus próximos horários
                  </Text>
                  {mySchedules.map((schedule) => (
                    <Flex
                      key={schedule.id}
                      bg="barber.900"
                      borderWidth={1}
                      borderColor={
                        editingId === schedule.id ? "orange.900" : "gray.700"
                      }
                      rounded={6}
                      p={3}
                      mb={2}
                      direction={{ base: "column", sm: "row" }}
                      align={{ base: "flex-start", sm: "center" }}
                      justify="space-between"
                      gap={3}
                    >
                      <Flex direction="column">
                        <Text color="white" fontWeight="bold">
                          {formatDateTime(schedule.scheduled_at)}
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          {schedule.haircut.name} -{" "}
                          {formatPrice(schedule.haircut.price)}
                        </Text>
                      </Flex>
                      <Flex gap={2}>
                        <Button
                          size="sm"
                          bg="barber.400"
                          color="white"
                          onClick={() => handleEdit(schedule)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          bg="red.900"
                          color="red.200"
                          onClick={() => handleCancel(schedule)}
                        >
                          Cancelar
                        </Button>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              )}

              {editingId && (
                <Flex w="85%" mb={3} justify="space-between" align="center">
                  <Text color="orange.900" fontSize="sm" fontWeight="bold">
                    Alterando um horário existente
                  </Text>
                  <Button size="sm" variant="ghost" color="gray.400" onClick={resetBookingForm}>
                    Novo agendamento
                  </Button>
                </Flex>
              )}

              <Select
                bg="barber.900"
                color="white"
                borderColor="gray.700"
                mb={3}
                size="lg"
                w="85%"
                value={haircutId}
                onChange={(e) => setHaircutId(e.target.value)}
              >
                {shopData.haircuts.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    style={{ backgroundColor: "#FFF", color: "#000" }}
                  >
                    {item.name} - {formatPrice(item.price)}
                  </option>
                ))}
              </Select>

              <Flex w="85%" mb={4} direction="column">
                <Text mb={2} color="gray.300" fontWeight="bold">
                  Escolha a data
                </Text>
                <BookingCalendar
                  value={date}
                  minDate={todayInput()}
                  closedWeekdays={closedWeekdays}
                  onChange={(nextDate) => {
                    setDate(nextDate);
                    if (!editingId) {
                      setSelectedSlot("");
                    }
                  }}
                />
              </Flex>

              <Text w="85%" mb={2} color="gray.300" fontWeight="bold">
                Horários
              </Text>
              <Text w="85%" mb={2} color="gray.400" fontSize="sm">
                Intervalo de {shopData.slot_interval_minutes} min, no horário de
                Brasília. Um horário ocupado não pode ser usado por outro
                cliente nem por outro tipo de corte.
              </Text>
              <Flex w="85%" mb={3} gap={4} wrap="wrap" align="center">
                <Flex align="center" gap={2}>
                  <Flex w="12px" h="12px" bg="barber.900" borderWidth={1} borderColor="gray.500" />
                  <Text fontSize="sm" color="white">
                    Livre
                  </Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Flex w="12px" h="12px" bg="red.900" borderWidth={1} borderColor="red.500" />
                  <Text fontSize="sm" color="red.300">
                    Ocupado
                  </Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Flex w="12px" h="12px" bg="barber.900" opacity={0.5} />
                  <Text fontSize="sm" color="gray.500">
                    Indisponível
                  </Text>
                </Flex>
              </Flex>

              <Flex w="85%" mb={4} wrap="wrap" gap={2}>
                {loadingSlots && (
                  <Text color="gray.400">Carregando horários...</Text>
                )}
                {!loadingSlots && slotError && (
                  <Text color="red.300">{slotError}</Text>
                )}
                {!loadingSlots && !slotError && dayClosed && (
                  <Text color="gray.400">
                    A barbearia não abre neste dia. Escolha outro no calendário.
                  </Text>
                )}
                {!loadingSlots &&
                  !slotError &&
                  !dayClosed &&
                  slots.length === 0 && (
                  <Text color="gray.400">
                    Nenhum horário neste dia. Escolha outra data.
                  </Text>
                )}
                {!loadingSlots &&
                  slots.some((slot) => slot.status === "available") === false &&
                  slots.length > 0 && (
                  <Text color="orange.300" w="100%">
                    Não há horário livre neste dia. Toque em outro dia no
                    calendário.
                  </Text>
                )}
                {slots.map((slot) => {
                  const isAvailable = slot.status === "available";
                  const isOccupied = slot.status === "occupied";
                  const isSelected =
                    Boolean(selectedSlot) &&
                    slotTime(selectedSlot) === slotTime(slot.at);

                  return (
                    <Button
                      key={slot.at}
                      size="sm"
                      bg={
                        isSelected
                          ? "button.cta"
                          : isOccupied
                            ? "red.900"
                            : "barber.900"
                      }
                      color={
                        isSelected
                          ? "gray.900"
                          : isOccupied
                            ? "red.200"
                            : isAvailable
                              ? "white"
                              : "gray.500"
                      }
                      borderWidth={1}
                      borderColor={isOccupied ? "red.500" : "gray.700"}
                      opacity={isAvailable || isSelected ? 1 : 0.7}
                      isDisabled={!isAvailable}
                      textDecoration={isAvailable ? "none" : "line-through"}
                      onClick={() => setSelectedSlot(slot.at)}
                    >
                      {formatSlot(slot.at)}
                    </Button>
                  );
                })}
              </Flex>

              <Text w="85%" mb={3} color="gray.400" fontSize="sm">
                {selectedSlot
                  ? `Horário escolhido: ${formatSlot(selectedSlot)}`
                  : "Toque em um horário livre e depois em Confirmar agendamento."}
              </Text>

              <Button
                w="85%"
                size="lg"
                color="gray.900"
                bg="button.cta"
                position="sticky"
                bottom={4}
                _hover={{ bg: "#FFb13e" }}
                isLoading={saving}
                onClick={handleSubmit}
              >
                {editingId ? "Salvar alteração" : "Confirmar agendamento"}
              </Button>
            </Flex>
          )}

          <Flex direction="column" mt={6}>
            <Text mb={2} fontWeight="bold">
              Funcionamento
            </Text>
            {shopData.businessHours.map((hour) => (
              <Text key={hour.weekday} color="gray.400" fontSize="sm">
                {WEEKDAYS[hour.weekday]}:{" "}
                {hour.closed
                  ? "Fechado"
                  : `${hour.opens_at} às ${hour.closes_at}`}
              </Text>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<AgendarShopProps> = async (
  ctx
) => {
  try {
    const slug = ctx.params?.slug;

    if (!slug || Array.isArray(slug)) {
      return {
        redirect: {
          destination: "/agendar",
          permanent: false,
        },
      };
    }

    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get(`/public/shops/${slug}`);

    return {
      props: {
        shop: response.data,
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/agendar",
        permanent: false,
      },
    };
  }
};
