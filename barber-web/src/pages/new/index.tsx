import { useState, useEffect, ChangeEvent } from "react";
import Head from "next/head";
import { Sidebar } from "@/src/components/sidebar";
import { Flex, Heading, Button, Input, Select, Text } from "@chakra-ui/react";
import { canSSRAuth } from "@/src/services/utils/canSSRAuth";
import { setupAPIClient } from "@/src/services/api";
import { useRouter } from "next/router";
import { AxiosError } from "axios";
import { formatShopTime, shopTodayInput } from "@/src/utils/shopTime";

interface HaircutProps {
  id: string;
  name: string;
  price: string;
  status: boolean;
}

interface NewProps {
  haircuts: HaircutProps[];
}

function todayInput() {
  return shopTodayInput();
}

function formatSlot(value: string) {
  return formatShopTime(value);
}

function getApiError(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ error?: string }>;
  return axiosError.response?.data?.error || fallback;
}

export default function New({ haircuts }: NewProps) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [haircutSelected, setHaircutSelected] = useState(haircuts[0]?.id || "");
  const [date, setDate] = useState(todayInput());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadSlots() {
      if (!date) {
        return;
      }

      setLoadingSlots(true);
      setSelectedSlot("");

      try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get("/schedules/slots", {
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
  }, [date]);

  function handleChangeSelect(id: string) {
    setHaircutSelected(id);
  }

  async function handleRegister() {
    if (customer === "" || phone === "") {
      alert("Preencha o nome e o telefone do cliente");
      return;
    }

    if (!selectedSlot) {
      alert("Escolha um horário livre");
      return;
    }

    try {
      const apiClient = setupAPIClient();
      await apiClient.post("/schedules", {
        customer,
        phone,
        haircut_id: haircutSelected,
        scheduled_at: selectedSlot,
      });
      router.push("/dashboard");
    } catch (err) {
      alert(getApiError(err, "Erro ao cadastrar corte"));
    }
  }

  return (
    <>
      <Head>
        <title>Novo Corte - Barber</title>
      </Head>
      <Sidebar>
        <Flex direction="column" align="flex-start" justify="flex-start">
          <Flex direction="row" w="100%" align="center" justify="flex-start">
            <Heading fontSize="3xl" mb={6} mt={4} mr={4}>
              Novo Corte
            </Heading>
          </Flex>
          <Flex
            maxW="700px"
            pt={8}
            pb={8}
            width="100%"
            direction="column"
            align="center"
            justify="center"
            bg="barber.400"
          >
            <Input
              placeholder="Nome do Cliente"
              w="85%"
              mb={3}
              size="lg"
              type="text"
              bg="barber.900"
              color="white"
              borderColor="gray.700"
              _placeholder={{ color: "gray.400" }}
              value={customer}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCustomer(e.target.value)
              }
            />

            <Input
              placeholder="Telefone do cliente"
              w="85%"
              mb={3}
              size="lg"
              type="tel"
              bg="barber.900"
              color="white"
              borderColor="gray.700"
              _placeholder={{ color: "gray.400" }}
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPhone(e.target.value)
              }
            />

            <Select
              bg="barber.900"
              color="white"
              borderColor="gray.700"
              mb={3}
              size="lg"
              w="85%"
              value={haircutSelected}
              onChange={(e) => handleChangeSelect(e.target.value)}
            >
              {haircuts?.map((item) => (
                <option
                  key={item?.id}
                  value={item?.id}
                  style={{ backgroundColor: "#FFF", color: " #000" }}
                >
                  {item?.name}
                </option>
              ))}
            </Select>

            <Input
              placeholder="Data"
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
              Horários livres da cadeira. Trocar o tipo de corte não libera um
              horário já ocupado.
            </Text>
            <Flex w="85%" mb={4} wrap="wrap" gap={2}>
              {loadingSlots && <Text color="gray.400">Carregando horários...</Text>}
              {!loadingSlots && slots.length === 0 && (
                <Text color="gray.400">Nenhum horário livre neste dia.</Text>
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
              onClick={handleRegister}
            >
              Cadastrar
            </Button>
          </Flex>
        </Flex>
      </Sidebar>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  try {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/haircuts", {
      params: {
        status: true,
      },
    });

    if (response.data === null) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    return {
      props: {
        haircuts: response.data,
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
