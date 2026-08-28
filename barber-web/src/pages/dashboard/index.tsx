import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Flex,
  Text,
  Heading,
  Button,
  Link as ChakraLink,
  useMediaQuery,
  useDisclosure,
} from "@chakra-ui/react";

import { canSSRAuth } from "@/src/services/utils/canSSRAuth";
import Link from "next/link";
import { IoMdPerson } from "react-icons/io";
import { Sidebar } from "../../components/sidebar";
import { setupAPIClient } from "@/src/services/api";
import { ModalInfo } from "../../components/modal";
import { BookingCalendar } from "@/src/components/bookingCalendar";
import {
  addShopDays,
  formatShopTime,
  shopTodayInput,
  shopWeekday,
} from "@/src/utils/shopTime";
import { normalizeDaySlots, SlotItem } from "@/src/utils/slots";

export interface SchudelItem {
  id: string;
  customer: string;
  status: string;
  scheduled_at: string;
  source?: string;
  client?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  haircut: {
    id: string;
    name: string;
    price: string | number;
    status: boolean;
    user_id: string;
  };
}

export function formatScheduleDateTime(value?: string) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

interface ShopHour {
  weekday: number;
  closed: boolean;
}

interface ScheduleProps {
  schedules: SchudelItem[];
  closedWeekdays: number[];
  slotInterval: number;
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

function slotTime(value: string) {
  const date = new Date(value);
  date.setSeconds(0, 0);
  return date.getTime();
}

export default function Dashboard({
  schedules,
  closedWeekdays,
  slotInterval,
}: ScheduleProps) {
  const [list, setList] = useState(schedules || []);
  const [service, setService] = useState<SchudelItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [date, setDate] = useState(() => nextOpenDate(closedWeekdays));
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [dayClosed, setDayClosed] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");

  const [isMobile] = useMediaQuery("(max-width: 500px)");

  useEffect(() => {
    async function loadSlots() {
      if (!date) {
        return;
      }

      setLoadingSlots(true);
      setSlotError("");

      try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get("/schedules/slots", {
          params: { date },
        });
        const parsed = normalizeDaySlots(response.data);
        setDayClosed(parsed.closed);
        setSlots(parsed.slots.filter((slot) => slot.at));
      } catch {
        setDayClosed(false);
        setSlots([]);
        setSlotError("Não foi possível carregar os horários.");
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [date, list.length]);

  function handleOpenModal(item: SchudelItem) {
    setService(item);
    onOpen();
  }

  function handleOpenSlot(slot: SlotItem) {
    if (slot.status !== "occupied") {
      return;
    }

    const booked = list.find(
      (item) => slotTime(item.scheduled_at) === slotTime(slot.at)
    );

    if (booked) {
      handleOpenModal(booked);
    }
  }

  async function handleFinish(id: string) {
    try {
      const apiClient = setupAPIClient();
      await apiClient.delete(`/schedules`, {
        params: {
          schedule_id: id,
        },
      });

      setList(list.filter((item) => item.id !== id));
      onClose();
    } catch (err) {
      console.log(err);
      onClose();
      alert("Erro ao finalizar serviço");
    }
  }

  return (
    <>
      <Head>
        <title>Dashboard - Barber</title>
      </Head>
      <Sidebar>
        <Flex direction="column" align="flex-start" justify="flex-start" w="100%">
          <Flex w="100%" direction="row" justify="flex-start" align="center">
            <Heading fontSize="3xl" mb={6} mr={4}>
              Agenda de Corte
            </Heading>
            <Link href="/new">
              <Button bg="white" _hover={{ bg: "white" }}>
                Registrar
              </Button>
            </Link>
          </Flex>

          <Flex
            w="100%"
            direction="column"
            bg="barber.400"
            p={6}
            rounded={8}
            mb={8}
          >
            <Text mb={3} color="gray.300" fontWeight="bold">
              Quadro de horários
            </Text>
            <Text mb={4} color="gray.400" fontSize="sm">
              Intervalo de {slotInterval} min, no horário de Brasília. Livre,
              ocupado e indisponível do dia escolhido.
            </Text>
            <BookingCalendar
              value={date}
              minDate={shopTodayInput()}
              closedWeekdays={closedWeekdays}
              onChange={setDate}
            />

            <Flex mt={4} mb={3} gap={4} wrap="wrap" align="center">
              <Flex align="center" gap={2}>
                <Flex
                  w="12px"
                  h="12px"
                  bg="barber.900"
                  borderWidth={1}
                  borderColor="gray.500"
                />
                <Text fontSize="sm" color="white">
                  Livre
                </Text>
              </Flex>
              <Flex align="center" gap={2}>
                <Flex
                  w="12px"
                  h="12px"
                  bg="red.900"
                  borderWidth={1}
                  borderColor="red.500"
                />
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

            <Flex wrap="wrap" gap={2}>
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
                  <Text color="gray.400">Nenhum horário neste dia.</Text>
                )}
              {slots.map((slot) => {
                const isAvailable = slot.status === "available";
                const isOccupied = slot.status === "occupied";
                const booked = isOccupied
                  ? list.find(
                      (item) => slotTime(item.scheduled_at) === slotTime(slot.at)
                    )
                  : undefined;

                return (
                  <Button
                    key={slot.at}
                    size="sm"
                    bg={isOccupied ? "red.900" : "barber.900"}
                    color={
                      isOccupied ? "red.200" : isAvailable ? "white" : "gray.500"
                    }
                    borderWidth={1}
                    borderColor={isOccupied ? "red.500" : "gray.700"}
                    opacity={isAvailable || isOccupied ? 1 : 0.7}
                    isDisabled={!isAvailable && !isOccupied}
                    textDecoration={isAvailable || isOccupied ? "none" : "line-through"}
                    title={
                      booked
                        ? booked.client?.name || booked.customer
                        : undefined
                    }
                    onClick={() => handleOpenSlot(slot)}
                  >
                    {formatShopTime(slot.at)}
                    {booked
                      ? ` · ${(booked.client?.name || booked.customer).split(" ")[0]}`
                      : ""}
                  </Button>
                );
              })}
            </Flex>
          </Flex>

          {list.length === 0 && (
            <Text color="gray.400">Nenhum cliente agendado no momento.</Text>
          )}

          {list.map((item) => (
            <ChakraLink
              onClick={() => handleOpenModal(item)}
              key={item?.id}
              w="100%"
              m={0}
              p={0}
              mt={1}
              bg="transparent"
              style={{ textDecoration: "none" }}
            >
              <Flex
                w="100%"
                direction={isMobile ? "column" : "row"}
                p={4}
                rounded={4}
                mb={4}
                bg="barber.400"
                justify="space-between"
                align={isMobile ? "flex-start" : "center"}
              >
                <Flex
                  direction="row"
                  mb={isMobile ? 4 : 0}
                  align="center"
                  justify="center"
                >
                  <IoMdPerson size={24} color="white" />
                  <Text fontWeight="bold" noOfLines={2} ml={4}>
                    {item?.client?.name || item?.customer}
                  </Text>
                </Flex>

                <Text fontWeight="bold">{item?.haircut?.name}</Text>
                <Text fontWeight="bold">
                  {formatScheduleDateTime(item?.scheduled_at)}
                </Text>
                <Text fontWeight="bold">R$ {item?.haircut?.price}</Text>
              </Flex>
            </ChakraLink>
          ))}
        </Flex>
      </Sidebar>
      {service && (
        <ModalInfo
          isOpen={isOpen}
          onOpen={onOpen}
          onClose={onClose}
          data={service}
          finishService={async () => handleFinish(service.id)}
        />
      )}
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  try {
    const apiClient = setupAPIClient(ctx);
    const [schedulesResponse, hoursResponse] = await Promise.all([
      apiClient.get("/schedules"),
      apiClient.get("/business-hours"),
    ]);

    const hours = Array.isArray(hoursResponse.data?.hours)
      ? hoursResponse.data.hours
      : [];

    return {
      props: {
        schedules: Array.isArray(schedulesResponse.data)
          ? schedulesResponse.data
          : [],
        closedWeekdays: hours
          .filter((item: ShopHour) => item.closed)
          .map((item: ShopHour) => item.weekday),
        slotInterval: Number(hoursResponse.data?.slot_interval_minutes) || 30,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        schedules: [],
        closedWeekdays: [],
        slotInterval: 30,
      },
    };
  }
});
