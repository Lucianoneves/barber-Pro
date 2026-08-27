import { useState } from "react";
import Head from "next/head";
import { Sidebar } from "@/src/components/sidebar";
import {
  Flex,
  Text,
  Heading,
  Button,
  useMediaQuery,
  Input,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiChevronLeft } from "react-icons/fi";

import { canSSRAuth } from "../../../services/utils/canSSRAuth";
import { setupAPIClient } from "@/src/services/api";
import router from "next/router";

interface NewHaircutProps {
  subscription: boolean;
  count: number;
}

export default function NewHaircut({ subscription, count }: NewHaircutProps) {
  const [isMobile] = useMediaQuery("(max-width: 500px)");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  async function handleRegister() {
    if (name === "" || price === "") {
      return;
    }

    if (!subscription && count >= 3) {
      alert("Você atingiu o limite de 3 cortes no plano grátis.");
      return;
    }

    const parsedPrice = Number(price.replace(",", "."));

    if (!parsedPrice || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Informe um preço válido. Ex: 45.00");
      return;
    }

    try {
      const apiClient = setupAPIClient();
      await apiClient.post("/haircuts", {
        name: name,
        price: parsedPrice,
      });
      router.push("/haircuts");
    } catch (err) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      alert(axiosError.response?.data?.error || "Erro ao cadastrar corte");
    }
  }

  return (
    <>
      <Head>
        <title>Novo corte - BarberPro</title>
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
            justifyContent="space-between"
            mb={isMobile ? 4 : 0}
          >
            <Link href="/haircuts">
              <Button p={4} display="flex" alignItems="center" mr={4}>
                <FiChevronLeft size={20} color="#FFF" />
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
              Modelos de Cortes
            </Heading>
          </Flex>
          <Flex
            maxW="700px"
            bg="barber.400"
            w="100%"
            align="center"
            pt={4}
            pb={4}
            direction="column"
          >
            <Heading mb={4} fontSize={isMobile ? "22px" : "2xl"}>
              Cadastrar modelo de corte
            </Heading>
            <Input
              placeholder="Nome do corte"
              size="lg"
              type="text"
              w="85%"
              bg="gray.900"
              mb={3}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              placeholder="Valor do corte"
              size="lg"
              type="text"
              w="85%"
              bg="gray.900"
              mb={4}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <Button
              w="85%"
              size="lg"
              color="gray.900"
              mb={6}
              bg="button.cta"
              _hover={{ bg: "#FFb13e" }}
              onClick={handleRegister}
              isDisabled={!subscription && count >= 3}
            >
              Cadastrar
            </Button>

            {!subscription && count >= 3 && (
              <Flex>
                <Text color="red.500" fontSize="sm" mb={6}>
                  Você atingiu o limite de modelos de corte.
                </Text>
                <Link href="/planos">
                  <Text fontWeight="bold" color="#31fb6A" cursor="pointer">
                    Seja Premium
                  </Text>
                </Link>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Sidebar>
    </>
  );
}

export const getServerSideProps = canSSRAuth(async (ctx) => {
  try {
    const apiClient = setupAPIClient(ctx);

    const response = await apiClient.get("/haircut/check");
    const count = await apiClient.get("/haircut/count");

    return {
      props: {
        subscription: response.data?.subscriptions?.status === "active",
        count: count.data?.count ?? 0,
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
