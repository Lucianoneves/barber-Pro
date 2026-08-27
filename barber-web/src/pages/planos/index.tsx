import Head from "next/head";
import { Button, Flex, Heading, Text } from "@chakra-ui/react";
import { Sidebar } from "../../components/sidebar";
import { canSSRAuth } from "../../services/utils/canSSRAuth";
import { setupAPIClient } from "../../services/api";

interface PlanosProps {
  premium: boolean;
}

export default function Planos({ premium }: PlanosProps) {
  const handleBuySubscription = async () => {
    if (premium) {
      return;
    }

    try {
      const apiClient = setupAPIClient();
      const response = await apiClient.post("/subscriptions");
      const { url } = response.data;

      if (!url) {
        alert("Erro ao iniciar o pagamento");
        return;
      }

      window.location.href = url;
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      console.log(err);
      alert(axiosError.response?.data?.error || "Erro ao iniciar o pagamento");
    }
  };

  async function handleCreatePortal() {
    try {
      if (!premium) {
        return;
      }

      const apiClient = setupAPIClient();
      const response = await apiClient.post("/create-portal");
      const { url } = response.data;

      if (!url) {
        alert("Erro ao abrir o portal da assinatura");
        return;
      }

      window.location.href = url;
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      console.log(err);
      alert(axiosError.response?.data?.error || "Erro ao criar portal");
    }
  }

  return (
    <>
      <Head>
        <title>Planos - Barber Sua Assinatura Premium</title>
      </Head>
      <Sidebar>
        <Flex
          w="100%"
          direction="column"
          align="flex-start"
          justify="flex-start"
        >
          <Heading fontSize="3xl" mb={6} mr={4}>
            Planos
          </Heading>
        </Flex>

        <Flex
          pb={8}
          maxW="780px"
          w="100%"
          direction="column"
          align="flex-start"
          justify="flex-start"
        >
          <Flex w="100%" gap={4} direction={{ base: "column", md: "row" }}>
            <Flex
              rounded={4}
              p={4}
              bg="barber.400"
              flex={1}
              w="100%"
              minW={0}
              direction="column"
            >
              <Heading
                textAlign="center"
                fontSize="2xl"
                fontWeight="bold"
                color="gray.100"
                mb={4}
                mt={4}
              >
                Plano grátis
              </Heading>

              <Text fontStyle="bold" ml={4} mb={2}>
                Registrar corte
              </Text>
              <Text fontStyle="bold" ml={4} mb={2}>
                Criar modelo de corte
              </Text>
              <Text fontStyle="bold" ml={4} mb={2}>
                Editar dodos de perfil{" "}
              </Text>
            </Flex>

            <Flex
              rounded={4}
              p={4}
              bg="barber.400"
              flex={1}
              w="100%"
              minW={0}
              direction="column"
            >
              <Heading
                textAlign="center"
                fontSize="2xl"
                fontWeight="bold"
                color="#31fb6a"
                mb={4}
                mt={4}
              >
                Premium
              </Heading>

              <Text fontStyle="bold" ml={4} mb={2}>
                Registrar corte ilimitados{" "}
              </Text>
              <Text fontStyle="bold" ml={4} mb={2}>
                Criar modelo de corte ilimitados
              </Text>
              <Text fontStyle="bold" ml={4} mb={2}>
                Editar dodos de perfil{" "}
              </Text>
              <Text fontStyle="bold" ml={4} mb={2}>
                Editar modelos de cortes{" "}
              </Text>
              <Text
                color="#31fb6a"
                fontStyle="bold"
                fontSize="2xl"
                ml={4}
                mb={2}
              >
                {" "}
                R$ 80,00{" "}
              </Text>

              <Button
                bg={premium ? "transparent" : "button.cta"}
                fontWeight="bold"
                m={5}
                color={premium ? "#31fb6a" : "white"}
                cursor={premium ? "default" : "pointer"}
                pointerEvents={premium ? "none" : "auto"}
                _hover={premium ? { bg: "transparent" } : { bg: "#FFb13e" }}
                onClick={handleBuySubscription}
              >
                {premium ? "Você já é premium" : "Vire premium"}
              </Button>
              {premium && (
                <Button
                  w="85%"
                  alignSelf="center"
                  mb={4}
                  bg="button.cta"
                  color="gray.900"
                  fontWeight="bold"
                  _hover={{ bg: "#FFb13e" }}
                  onClick={handleCreatePortal}
                >
                  Alterar assinatura
                </Button>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Sidebar>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  try {
    const apiClient = setupAPIClient(ctx);
    const sessionId = ctx.query.session_id;

    if (typeof sessionId === "string" && sessionId) {
      try {
        await apiClient.post("/subscriptions/confirm", {
          session_id: sessionId,
        });
      } catch (confirmError) {
        console.log(confirmError);
      }
    }

    const response = await apiClient.get("/me");

    return {
      props: {
        premium:
          response.data?.subscriptions?.status === "active" ? true : false,
      },
    };
  } catch (err) {
    console.log(err);

    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }
});
