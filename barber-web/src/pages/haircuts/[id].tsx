import { useState, ChangeEvent } from "react";
import Head from "next/head";
import { Sidebar } from "@/src/components/sidebar";
import {
  Flex,
  Text,
  Heading,
  Button,
  Stack,
  Switch,
  useMediaQuery,
  Input,
} from "@chakra-ui/react";
import { FiChevronLeft } from "react-icons/fi";
import Link from "next/link";
import Router from "next/router";

import { canSSRAuth } from "../../services/utils/canSSRAuth";
import { setupAPIClient } from "../../services/api";

interface HaircutProps {
  id: string;
  name: string;
  price: number | string;
  status: boolean;
  user_id: string;
}

interface SubscriptionProps {
  id: string;
  status: string;
}

interface EditHaircutProps {
  haircut: HaircutProps;
  subscription: SubscriptionProps | null;
}

export default function EditHaircut({
  haircut,
  subscription,
}: EditHaircutProps) {
  // Recebe os dados do corte e o plano do usuário
  const [isMobile] = useMediaQuery("(max-width: 500px)");

  const [name, setName] = useState(haircut?.name || "");
  const [price, setPrice] = useState(String(haircut?.price ?? ""));
  const [status, setStatus] = useState(haircut?.status);

  function handleChangeStatus(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value === "disabled") {
      setStatus(false);
    } else {
      setStatus(true);
    }
  }

  async function handleUpdate() {
    if (name === "" || price === "") {
      return;
    }

    const parsedPrice = Number(String(price).replace(",", "."));

    if (!parsedPrice || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      // Verifica se o preço é válido
      alert("Informe um preço válido. Ex: 45.00");
      return;
    }

    try {
      const apiClient = setupAPIClient();
      await apiClient.put("/haircuts", {
        haircut_id: haircut.id,
        name,
        price: parsedPrice,
        status,
      });

      Router.push("/haircuts");
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Erro ao atualizar corte");
    }
  }

  return (
    <>
      <Head>
        <title>Editar Corte - BarberPro</title>
      </Head>
      <Sidebar>
        <Flex
          direction="column"
          w="100%"
          maxW="800px"
          mx="auto"
          justifyContent="flex-start"
          alignItems="flex-start"
        >
          <Flex
            direction={isMobile ? "column" : "row"}
            w="100%"
            alignItems={isMobile ? "flex-start" : "center"}
            justifyContent="flex-start"
            mb={isMobile ? 4 : 0}
          >
            <Link href="/haircuts">
              <Button
                mr={3}
                p={4}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
              >
                <FiChevronLeft size={24} color="#FFF" />
                Voltar
              </Button>
            </Link>
            <Heading
              fontSize={isMobile ? "28px" : "3xl"}
              mt={6}
              mb={6}
              mr={4}
              color="orange.900"
            >
              Editar Corte
            </Heading>
          </Flex>
          <Flex
            w="100%"
            maxW="700px"
            justify="center"
            align="center"
            direction="column"
            pt={8}
            pb={8}
            px={8}
            mb={6}
          >
            <Heading
              fontSize={isMobile ? "24px" : "3xl"}
              mb={6}
              color="orange.900"
            >
              Editar Corte
            </Heading>

            <Flex w="100%" direction="column">
              <Input
                placeholder="Nome do Corte"
                bg="gray.900"
                mb={3}
                size="lg"
                type="text"
                w="100%"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                placeholder="Valor do Corte"
                bg="gray.900"
                mb={3}
                size="lg"
                type="text"
                inputMode="decimal"
                w="100%"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <Stack w="100%" spacing={4}>
                <Text> Desativar corte </Text>
                <Switch
                  size="lg"
                  colorScheme="red"
                  value={status ? "disabled" : "enabled"}
                  isChecked={!status}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleChangeStatus(e)
                  }
                />

                <Button
                  w="100%"
                  size="lg"
                  bg="button.cta"
                  color="gray.900"
                  _hover={{ bg: "orange.700" }}
                  onClick={handleUpdate}
                  isDisabled={subscription?.status !== "active"}
                >
                  Salvar
                </Button>

                {subscription?.status !== "active" && (
                  <Flex direction="column" align="center" justify="center">
                    <Link href="/planos">
                      <Text fontWeight="bold" color="#31fb6A" cursor="pointer">
                        Seja premium para editar este corte
                      </Text>
                    </Link>
                    <Text>e tenha todos os cortes disponíveis</Text>
                  </Flex>
                )}
              </Stack>
            </Flex>
          </Flex>
        </Flex>
      </Sidebar>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  const { id } = ctx.params as { id: string };

  try {
    const apiClient = setupAPIClient(ctx);

    const check = await apiClient.get("/haircut/check");

    const response = await apiClient.get("/haircut/detail", {
      params: {
        haircut_id: id,
      },
    });

    const haircut = Array.isArray(response.data)
      ? response.data[0]
      : response.data;

    if (!haircut) {
      return {
        redirect: {
          destination: "/haircuts",
          permanent: false,
        },
      };
    }

    return {
      props: {
        haircut,
        subscription: check.data?.subscriptions ?? null,
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/haircuts",
        permanent: false,
      },
    };
  }
});
