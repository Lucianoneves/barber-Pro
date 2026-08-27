import { useEffect, useState, ChangeEvent } from "react";
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
import { setupAPIClient } from "@/src/services/api";
import { GetServerSideProps } from "next";
import { AxiosError } from "axios";

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
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatSlot(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default function AgendarShop({ shop }: AgendarShopProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [customer, setCustomer] = useState("");
  const [knownCustomer, setKnownCustomer] = useState(false);
  const [haircutId, setHaircutId] = useState(shop.haircuts[0]?.id || "");
  const [date, setDate] = useState(todayInput());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{
    scheduled_at: string;
    haircut: HaircutItem;
  } | null>(null);

  useEffect(() => {
    async function loadSlots() {
      if (!date) {
        return;
      }

      setLoadingSlots(true);
      setSelectedSlot("");

      try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get(`/public/shops/${shop.slug}/slots`, {
          params: { date },
        });
        setSlots(Array.isArray(response.data) ? response.data : []);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [date, shop.slug]);

  async function handlePhoneBlur() {
    if (!phone) {
      setKnownCustomer(false);
      return;
    }

    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.get(
        `/public/shops/${shop.slug}/customer`,
        { params: { phone } }
      );

      if (response.data?.exists && response.data?.name) {
        setCustomer(response.data.name);
        setKnownCustomer(true);
      } else {
        setKnownCustomer(false);
      }
    } catch {
      setKnownCustomer(false);
    }
  }

  async function handleSubmit() {
    if (!customer || !phone || !haircutId || !selectedSlot) {
      alert("Preencha nome, telefone, corte e um horário livre");
      return;
    }

    setSaving(true);

    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.post("/public/schedules", {
        slug: shop.slug,
        customer,
        phone,
        haircut_id: haircutId,
        scheduled_at: selectedSlot,
      });

      setDone({
        scheduled_at: response.data.scheduled_at,
        haircut: response.data.haircut,
      });
    } catch (err) {
      alert(getApiError(err, "Erro ao agendar"));
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
              Agendamento confirmado
            </Heading>
            <Text color="white" mb={2}>
              {customer}, você está cadastrado em {shop.name}.
            </Text>
            <Text color="gray.300" mb={2}>
              Corte: {done.haircut.name}
            </Text>
            <Text color="gray.300" mb={6}>
              Horário:{" "}
              {new Date(done.scheduled_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Button
              bg="button.cta"
              color="gray.900"
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

          {shop.haircuts.length === 0 ? (
            <Text color="gray.400">
              Esta barbearia ainda não cadastrou cortes ativos.
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
                bg="barber.900"
                color="white"
                borderColor="gray.700"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
                onBlur={handlePhoneBlur}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCustomer(e.target.value)
                }
              />

              {knownCustomer && (
                <Text w="85%" mb={3} color="green.300" fontSize="sm">
                  Encontramos seu cadastro nesta barbearia.
                </Text>
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
                {shop.haircuts.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                    style={{ backgroundColor: "#FFF", color: "#000" }}
                  >
                    {item.name} - {formatPrice(item.price)}
                  </option>
                ))}
              </Select>

              <Input
                w="85%"
                mb={3}
                size="lg"
                type="date"
                min={todayInput()}
                bg="barber.900"
                color="white"
                borderColor="gray.700"
                value={date}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setDate(e.target.value)
                }
              />

              <Text w="85%" mb={2} color="gray.400" fontSize="sm">
                Horários livres a cada {shop.slot_interval_minutes} min
              </Text>

              <Flex w="85%" mb={4} wrap="wrap" gap={2}>
                {loadingSlots && <Text color="gray.400">Carregando horários...</Text>}
                {!loadingSlots && slots.length === 0 && (
                  <Text color="gray.400">
                    Nenhum horário livre neste dia.
                  </Text>
                )}
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    size="sm"
                    bg={selectedSlot === slot ? "button.cta" : "barber.900"}
                    color={selectedSlot === slot ? "gray.900" : "white"}
                    borderWidth={1}
                    borderColor="gray.700"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {formatSlot(slot)}
                  </Button>
                ))}
              </Flex>

              <Button
                w="85%"
                size="lg"
                color="gray.900"
                bg="button.cta"
                _hover={{ bg: "#FFb13e" }}
                isLoading={saving}
                onClick={handleSubmit}
              >
                Confirmar agendamento
              </Button>
            </Flex>
          )}

          <Flex direction="column" mt={6}>
            <Text mb={2} fontWeight="bold">
              Funcionamento
            </Text>
            {shop.businessHours.map((hour) => (
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
