import Head from "next/head";
import Link from "next/link";
import { Flex, Heading, Text, Button } from "@chakra-ui/react";
import { PublicHeader } from "@/src/components/publicHeader";
import { setupAPIClient } from "@/src/services/api";

interface ShopItem {
  name: string;
  slug: string;
  endereco: string | null;
  haircuts_count: number;
}

interface AgendarProps {
  shops: ShopItem[];
}

export default function Agendar({ shops }: AgendarProps) {
  return (
    <>
      <Head>
        <title>Agendar corte - BarberPro</title>
      </Head>
      <Flex direction="column" minH="100vh" bg="barber.900" px={4} pb={10}>
        <PublicHeader />
        <Flex
          direction="column"
          w="100%"
          maxW="800px"
          mx="auto"
          align="flex-start"
        >
          <Heading color="orange.900" mb={2} fontSize="3xl">
            Escolha a barbearia
          </Heading>
          <Text mb={6} color="gray.300">
            Você será cadastrado na casa escolhida com o seu telefone.
          </Text>

          {shops.length === 0 && (
            <Text color="gray.400">
              Nenhuma barbearia com cortes disponíveis no momento.
            </Text>
          )}

          {shops.map((shop) => (
            <Flex
              key={shop.slug}
              w="100%"
              bg="barber.400"
              p={4}
              rounded={6}
              mb={4}
              direction={{ base: "column", sm: "row" }}
              align={{ base: "flex-start", sm: "center" }}
              justify="space-between"
              gap={4}
            >
              <Flex direction="column">
                <Text fontWeight="bold" fontSize="lg" color="white">
                  {shop.name}
                </Text>
                <Text color="gray.400">
                  {shop.endereco || "Endereço não informado"}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {shop.haircuts_count}{" "}
                  {shop.haircuts_count === 1 ? "corte" : "cortes"}
                </Text>
              </Flex>
              <Link href={`/agendar/${shop.slug}`}>
                <Button
                  as="span"
                  bg="button.cta"
                  color="gray.900"
                  _hover={{ bg: "#FFb13e" }}
                  cursor="pointer"
                >
                  Agendar
                </Button>
              </Link>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </>
  );
}

export const getServerSideProps = async () => {
  try {
    const apiClient = setupAPIClient();
    const response = await apiClient.get("/public/shops");

    return {
      props: {
        shops: Array.isArray(response.data) ? response.data : [],
      },
    };
  } catch {
    return {
      props: {
        shops: [],
      },
    };
  }
};
