import { useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { Flex, Heading, Text } from "@chakra-ui/react";
import { PublicHeader } from "@/src/components/publicHeader";
import { setupAPIClient } from "@/src/services/api";
import { readLastShop } from "@/src/utils/lastShop";
import { readCustomerAccess } from "@/src/utils/customerAccess";

interface ShopItem {
  name: string;
  slug: string;
  endereco: string | null;
  haircuts_count: number;
}

interface AgendarProps {
  shops: ShopItem[];
}

function ShopCard({
  href,
  title,
  subtitle,
  extra,
  action,
  highlight = false,
}: {
  href: string;
  title: string;
  subtitle: string;
  extra?: string;
  action: string;
  highlight?: boolean;
}) {
  return (
    <NextLink href={href} style={{ width: "100%", textDecoration: "none" }}>
      <Flex
        w="100%"
        bg="barber.400"
        p={4}
        rounded={6}
        mb={4}
        direction={{ base: "column", sm: "row" }}
        align={{ base: "flex-start", sm: "center" }}
        justify="space-between"
        gap={4}
        cursor="pointer"
        borderWidth={highlight ? 1 : 0}
        borderColor="orange.900"
        _hover={{ opacity: 0.92 }}
      >
        <Flex direction="column">
          <Text fontWeight="bold" fontSize="lg" color="white">
            {title}
          </Text>
          <Text color="gray.400">{subtitle}</Text>
          {extra && (
            <Text color="gray.500" fontSize="sm">
              {extra}
            </Text>
          )}
        </Flex>
        <Flex
          as="span"
          bg="button.cta"
          color="gray.900"
          fontWeight="bold"
          px={6}
          py={2}
          rounded={6}
        >
          {action}
        </Flex>
      </Flex>
    </NextLink>
  );
}

export default function Agendar({ shops: initialShops }: AgendarProps) {
  const [shops, setShops] = useState<ShopItem[]>(initialShops);
  const [loading, setLoading] = useState(initialShops.length === 0);
  const [lastShop, setLastShop] = useState<{ slug: string; name: string } | null>(
    null
  );
  const [hasCustomerAccess, setHasCustomerAccess] = useState(false);

  useEffect(() => {
    const savedShop = readLastShop();
    setLastShop(savedShop);
    setHasCustomerAccess(
      Boolean(savedShop && readCustomerAccess(savedShop.slug))
    );

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
            Toque na barbearia desejada para agendar. Depois do primeiro horário
            você fica com um acesso só seu nessa casa, para alterar ou cancelar
            sem ver a agenda de outros clientes.
          </Text>

          {lastShop && (
            <ShopCard
              href={`/agendar/${lastShop.slug}`}
              title={lastShop.name}
              subtitle={
                hasCustomerAccess
                  ? "Seu acesso já está nesta casa. Só você vê, altera ou cancela os seus horários."
                  : "Você já agendou aqui. Seu cadastro fica nesta barbearia pelo telefone."
              }
              action={hasCustomerAccess ? "Meus horários" : "Continuar"}
              highlight
            />
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
            <ShopCard
              key={shop.slug}
              href={`/agendar/${shop.slug}`}
              title={shop.name}
              subtitle={shop.endereco || "Endereço não informado"}
              extra={`${shop.haircuts_count} ${
                shop.haircuts_count === 1 ? "corte" : "cortes"
              }`}
              action="Escolher"
            />
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
