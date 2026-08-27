import { useState, ChangeEvent } from "react";
import Head from "next/head";
import {
  Flex,
  Heading,
  Text,
  Input,
  Button,
  Switch,
  Select,
} from "@chakra-ui/react";
import { Sidebar } from "@/src/components/sidebar";
import { canSSRAuth } from "@/src/services/utils/canSSRAuth";
import { setupAPIClient } from "@/src/services/api";
import { AxiosError } from "axios";

interface HourItem {
  weekday: number;
  closed: boolean;
  opens_at: string | null;
  closes_at: string | null;
}

interface HoursProps {
  slug: string;
  slot_interval_minutes: number;
  hours: HourItem[];
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

function getApiError(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ error?: string }>;
  return axiosError.response?.data?.error || fallback;
}

export default function Hours({
  slug,
  slot_interval_minutes,
  hours,
}: HoursProps) {
  const [interval, setInterval] = useState(String(slot_interval_minutes));
  const [days, setDays] = useState<HourItem[]>(hours);
  const [saving, setSaving] = useState(false);

  function updateDay(weekday: number, patch: Partial<HourItem>) {
    setDays((current) =>
      current.map((item) =>
        item.weekday === weekday ? { ...item, ...patch } : item
      )
    );
  }

  async function handleSave() {
    setSaving(true);

    try {
      const apiClient = setupAPIClient();
      await apiClient.put("/business-hours", {
        slot_interval_minutes: Number(interval),
        hours: days.map((item) => ({
          weekday: item.weekday,
          closed: item.closed,
          opens_at: item.opens_at,
          closes_at: item.closes_at,
        })),
      });
      alert("Horários salvos com sucesso");
    } catch (err) {
      alert(getApiError(err, "Erro ao salvar horários"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Horários - BarberPro</title>
      </Head>
      <Sidebar>
        <Flex direction="column" w="100%" maxW="800px">
          <Heading fontSize="3xl" mb={2} mt={4} color="orange.900">
            Horário de funcionamento
          </Heading>
          <Text mb={6} color="gray.400">
            Os horários seguem o fuso de Brasília. O cliente vê a grade até o
            fechamento, de acordo com o intervalo entre cortes.
          </Text>

          <Flex
            direction="column"
            bg="barber.400"
            p={8}
            rounded={8}
            mb={6}
          >
            <Text mb={2} fontWeight="bold">
              Intervalo entre cortes
            </Text>
            <Select
              bg="barber.900"
              color="white"
              borderColor="gray.700"
              mb={6}
              maxW="240px"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
            >
              <option value="15" style={{ backgroundColor: "#FFF", color: "#000" }}>
                15 minutos
              </option>
              <option value="20" style={{ backgroundColor: "#FFF", color: "#000" }}>
                20 minutos
              </option>
              <option value="30" style={{ backgroundColor: "#FFF", color: "#000" }}>
                30 minutos
              </option>
              <option value="45" style={{ backgroundColor: "#FFF", color: "#000" }}>
                45 minutos
              </option>
              <option value="60" style={{ backgroundColor: "#FFF", color: "#000" }}>
                60 minutos
              </option>
            </Select>

            {days.map((item) => (
              <Flex
                key={item.weekday}
                direction={{ base: "column", md: "row" }}
                align={{ base: "flex-start", md: "center" }}
                justify="space-between"
                mb={4}
                gap={3}
              >
                <Text w="120px" fontWeight="bold">
                  {WEEKDAYS[item.weekday]}
                </Text>
                <Flex align="center" gap={2}>
                  <Switch
                    isChecked={!item.closed}
                    colorScheme="orange"
                    onChange={(e) =>
                      updateDay(item.weekday, {
                        closed: !e.target.checked,
                        opens_at: e.target.checked
                          ? item.opens_at || "09:00"
                          : null,
                        closes_at: e.target.checked
                          ? item.closes_at || "19:00"
                          : null,
                      })
                    }
                  />
                  <Text fontSize="sm" color="gray.400">
                    {item.closed ? "Fechado" : "Aberto"}
                  </Text>
                </Flex>
                <Flex gap={3} w={{ base: "100%", md: "auto" }}>
                  <Input
                    type="time"
                    bg="barber.900"
                    color="white"
                    borderColor="gray.700"
                    value={item.opens_at || ""}
                    isDisabled={item.closed}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateDay(item.weekday, {
                        opens_at: e.target.value.slice(0, 5),
                      })
                    }
                  />
                  <Input
                    type="time"
                    bg="barber.900"
                    color="white"
                    borderColor="gray.700"
                    value={item.closes_at || ""}
                    isDisabled={item.closed}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      updateDay(item.weekday, {
                        closes_at: e.target.value.slice(0, 5),
                      })
                    }
                  />
                </Flex>
              </Flex>
            ))}

            <Button
              mt={4}
              bg="button.cta"
              color="gray.900"
              _hover={{ bg: "#FFb13e" }}
              isLoading={saving}
              onClick={handleSave}
            >
              Salvar horários
            </Button>
          </Flex>

          <Text color="gray.500" fontSize="sm">
            Link público: /agendar/{slug}
          </Text>
        </Flex>
      </Sidebar>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  try {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/business-hours");

    return {
      props: {
        slug: response.data.slug,
        slot_interval_minutes: response.data.slot_interval_minutes,
        hours: response.data.hours,
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }
});
