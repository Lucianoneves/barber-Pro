import Head from "next/head";
import { Flex, Heading, Text, useMediaQuery } from "@chakra-ui/react";
import { IoMdPerson } from "react-icons/io";
import { Sidebar } from "@/src/components/sidebar";
import { canSSRAuth } from "@/src/services/utils/canSSRAuth";
import { setupAPIClient } from "@/src/services/api";
import { formatShopDateTime } from "@/src/utils/shopTime";

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  last_schedule: {
    scheduled_at: string;
    haircut: {
      name: string;
    };
  } | null;
}

interface CustomersProps {
  customers: CustomerItem[];
}

function formatPhone(phone: string) {
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone;
}

export default function Customers({ customers }: CustomersProps) {
  const [isMobile] = useMediaQuery("(max-width: 500px)");

  return (
    <>
      <Head>
        <title>Clientes - BarberPro</title>
      </Head>
      <Sidebar>
        <Flex direction="column" align="flex-start" justify="flex-start">
          <Heading fontSize="3xl" mb={6} mt={4} color="orange.900">
            Clientes da casa
          </Heading>

          {customers.length === 0 && (
            <Text color="gray.400">
              Ainda não há clientes cadastrados nesta barbearia.
            </Text>
          )}

          {customers.map((item) => (
            <Flex
              key={item.id}
              w="100%"
              direction={isMobile ? "column" : "row"}
              p={4}
              rounded={4}
              mb={4}
              bg="barber.400"
              justify="space-between"
              align={isMobile ? "flex-start" : "center"}
            >
              <Flex align="center" mb={isMobile ? 3 : 0}>
                <IoMdPerson size={24} color="white" />
                <Flex direction="column" ml={4}>
                  <Text fontWeight="bold">{item.name}</Text>
                  <Text color="gray.400">{formatPhone(item.phone)}</Text>
                </Flex>
              </Flex>
              <Text color="gray.300">
                {item.last_schedule
                  ? `${item.last_schedule.haircut.name} - ${formatShopDateTime(
                      item.last_schedule.scheduled_at
                    )}`
                  : "Sem agendamento"}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Sidebar>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  try {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/customers");

    return {
      props: {
        customers: Array.isArray(response.data) ? response.data : [],
      },
    };
  } catch {
    return {
      props: {
        customers: [],
      },
    };
  }
});
