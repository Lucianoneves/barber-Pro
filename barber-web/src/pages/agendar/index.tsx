import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Flex, Heading, Text, Button } from "@chakra-ui/react";
import { PublicHeader } from "@/src/components/publicHeader";
import { setupAPIClient } from "@/src/services/api";
import { readLastShop } from "@/src/utils/lastShop";

interface ShopItem {
  name: string;
  slug: string;
  endereco: string | null;
  haircuts_count: number;
}

interface AgendarProps {
  shops: ShopItem[];
}

export default function Agendar({ shops: initialShops }: AgendarProps) {
  const [shops, setShops] = useState<ShopItem[]>(initialShops);
  const [loading, setLoading] = useState(initialShops.length === 0);
  const [lastShop, setLastShop] = useState<{ slug: string; name: string } | null>(
    null
  );

  useEffect(() => {
    setLastShop(readLastShop());

    if (initialShops.length > 0) {
      setLoading(false);
      return;
    }

    async function loadShops() {
      try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get("/public/shops");
        setShops(Array.isArray(response.data) ? response.data : []);
      } catch {
        setShops([]);
      } finally {
        setLoading(false);
      }
    }

    loadShops();
  }, [initialShops.length]);

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
            Escolha a casa, informe seu telefone e agende. No primeiro horário
            você já fica cadastrado nessa barbearia.
          </Text>

          {lastShop && (
            <Flex
              w="100%"
              bg="barber.400"
              p={4}
              rounded={6}
              mb={6}
              direction={{ base: "column", sm: "row" }}
              align={{ base: "flex-start", sm: "center" }}
              justify="space-between"
              gap={4}
              borderWidth={1}
              borderColor="orange.900"
            >
              <Flex direction="column">
                <Text color="orange.900" fontSize="sm" fontWeight="bold">
                  Você já agendou aqui
                </Text>
                <Text fontWeight="bold" fontSize="lg" color="white">
                  {lastShop.name}
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Seu cadastro fica nesta barbearia pelo telefone.
                </Text>
              </Flex>
              <Link href={`/agendar/${lastShop.slug}`}>
                <Button
                  as="span"
                  bg="button.cta"
                  color="gray.900"
                  _hover={{ bg: "#FFb13e" }}
                  cursor="pointer"
                >
                  Continuar agendamento
                </Button>
              </Link>
            </Flex>
          )}

          {loading && (
            <Text color="gray.400">Carregando barbearias...</Text>
          )}

          {!loading && shops.length === 0 && (
            <Text color="gray.400">
              Nenhuma barbearia cadastrada no momento.
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
              {shop.haircuts_count === 0 ? (
                <Button
                  as="span"
                  bg="barber.900"
                  color="gray.500"
                  cursor="not-allowed"
                >
                  Sem cortes
                </Button>
              ) : (
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
              )}
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
