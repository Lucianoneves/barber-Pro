import { useState } from "react";
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

interface ScheduleProps {
  schedules: SchudelItem[];
}

export default function Dashboard({ schedules }: ScheduleProps) {
  const [list, setList] = useState(schedules || []);
  const [service, setService] = useState<SchudelItem | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [isMobile] = useMediaQuery("(max-width: 500px)");

  function handleOpenModal(item: SchudelItem) {
    setService(item);
    onOpen();
  }

  async function handleFinish(id: string) {
    try {
      const apiClient = setupAPIClient();
      await apiClient.delete(`/schedules`, {
        params: {
          schedule_id: id,
        },
      });

      const filterItem = list.filter((item) => {
        return item.id !== id;
      });
      setList(filterItem);
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
        <Flex direction="column" align="flex-start" justify="flex-start">
          <Flex w="100%" direction="row" justify="flex-start" align="center">
            <Heading font-size="3xl" mb={6} mr={4}>
              Agenda de Corte
            </Heading>
            <Link href="/new">
              <Button bg="white" _hover={{ bg: "white" }}>
                Registrar
              </Button>
            </Link>
          </Flex>

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
      <ModalInfo
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        data={service}
        finishService={async () => handleFinish(service?.id)}
      />
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  try {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/schedules");

    return {
      props: {
        schedules: Array.isArray(response.data) ? response.data : [],
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        schedules: [],
      },
    };
  }
});
