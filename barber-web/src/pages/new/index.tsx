import { useState, useEffect, ChangeEvent } from "react";
import Head from "next/head";
import { Sidebar } from "@/src/components/sidebar";
import { Flex, Heading, Button, Input, Select, Text } from "@chakra-ui/react";
import { canSSRAuth } from "@/src/services/utils/canSSRAuth";
import { setupAPIClient } from "@/src/services/api";
import { useRouter } from "next/router";
import { AxiosError } from "axios";
import { formatShopTime, shopTodayInput } from "@/src/utils/shopTime";
import { formatPhone, formatPhoneInput } from "@/src/utils/phone";
import { normalizeDaySlots } from "@/src/utils/slots";

interface HaircutProps {
  id: string;
  name: string;
  price: string;
  status: boolean;
}

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
}

interface NewProps {
  haircuts: HaircutProps[];
  customers: CustomerItem[];
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

function normalizeSearch(value: string) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function filterCustomers(
  customers: CustomerItem[],
  { name, phone }: { name?: string; phone?: string }
) {
  if (name) {
    const query = normalizeSearch(name);

    if (!query) {
      return [];
    }

    return customers
      .filter((item) => normalizeSearch(item.name).includes(query))
      .slice(0, 10);
  }

  if (phone) {
    const query = phone.replace(/\D/g, "");

    if (!query) {
      return [];
    }

    return customers
      .filter((item) => item.phone.includes(query))
      .slice(0, 10);
  }

  return [];
}

function alreadySelected(
  matches: CustomerItem[],
  customer: string,
  phone: string
) {
  return (
    matches.length === 1 &&
    matches[0].name === customer &&
    matches[0].phone === phone
  );
}

export default function New({ haircuts, customers }: NewProps) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [haircutSelected, setHaircutSelected] = useState(haircuts[0]?.id || "");
  const [date, setDate] = useState(todayInput());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const router = useRouter();

  const nameMatches = filterCustomers(customers, { name: customer });
  const phoneMatches = filterCustomers(customers, { phone });
  const showNameSuggestions =
    nameMatches.length > 0 && !alreadySelected(nameMatches, customer, phone);
  const showPhoneSuggestions =
    phoneMatches.length > 0 && !alreadySelected(phoneMatches, customer, phone);

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
        const parsed = normalizeDaySlots(response.data);
        setSlots(
          parsed.closed
            ? []
            : parsed.slots
                .filter((slot) => slot.status === "available" && slot.at)
                .map((slot) => slot.at)
        );
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

  function pickCustomer(item: CustomerItem) {
    setCustomer(item.name);
    setPhone(formatPhoneInput(item.phone));
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
            <Text w="85%" mb={3} color="gray.400" fontSize="sm">
              Ao digitar o nome ou o telefone, aparecem os clientes cadastrados
              nesta casa. Exemplo: Carlos mostra todos os Carlos.
            </Text>
            <Flex w="85%" mb={3} direction="column">
              <Input
                placeholder="Nome do Cliente"
                w="100%"
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
              {showNameSuggestions && (
                <Flex
                  mt={1}
                  direction="column"
                  bg="barber.900"
                  borderWidth={1}
                  borderColor="gray.700"
                  rounded={6}
                  overflow="hidden"
                >
                  {nameMatches.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      justifyContent="space-between"
                      color="white"
                      rounded={0}
                      h="auto"
                      py={3}
                      px={4}
                      _hover={{ bg: "barber.400" }}
                      onClick={() => pickCustomer(item)}
                    >
                      <Text>{item.name}</Text>
                      <Text color="gray.400" fontWeight="normal" ml={3}>
                        {formatPhone(item.phone)}
                      </Text>
                    </Button>
                  ))}
                </Flex>
              )}
            </Flex>

            <Flex w="85%" mb={3} direction="column">
              <Input
                placeholder="(11) 99999-9999"
                w="100%"
                size="lg"
                type="tel"
                inputMode="numeric"
                autoComplete="off"
                maxLength={15}
                bg="barber.900"
                color="white"
                borderColor="gray.700"
                _placeholder={{ color: "gray.400" }}
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPhone(formatPhoneInput(e.target.value))
                }
              />
              {showPhoneSuggestions && (
                <Flex
                  mt={1}
                  direction="column"
                  bg="barber.900"
                  borderWidth={1}
                  borderColor="gray.700"
                  rounded={6}
                  overflow="hidden"
                >
                  {phoneMatches.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      justifyContent="space-between"
                      color="white"
                      rounded={0}
                      h="auto"
                      py={3}
                      px={4}
                      _hover={{ bg: "barber.400" }}
                      onClick={() => pickCustomer(item)}
                    >
                      <Text>{item.name}</Text>
                      <Text color="gray.400" fontWeight="normal" ml={3}>
                        {formatPhone(item.phone)}
                      </Text>
                    </Button>
                  ))}
                </Flex>
              )}
            </Flex>

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
    const haircutsResponse = await apiClient.get("/haircuts", {
      params: {
        status: true,
      },
    });

    if (haircutsResponse.data === null) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    let customers: CustomerItem[] = [];

    try {
      const customersResponse = await apiClient.get("/customers");
      customers = Array.isArray(customersResponse.data)
        ? customersResponse.data.map((item: CustomerItem) => ({
            id: item.id,
            name: item.name,
            phone: item.phone,
          }))
        : [];
    } catch {
      customers = [];
    }

    return {
      props: {
        haircuts: haircutsResponse.data,
        customers,
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
