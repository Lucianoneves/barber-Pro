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
} from "@chakra-ui/react";
import { IoMdPricetag } from "react-icons/io";
import { canSSRAuth } from "@/src/services/utils/canSSRAuth";
import { setupAPIClient } from "@/src/services/api";
import Link from "next/link";

interface HaircutsItem {
  id: string;
  name: string;
  price: number | string;
  status: boolean;
}

interface HaircutsProps {
  haircuts: HaircutsItem[];
}

export default function Haircuts({ haircuts }: HaircutsProps) {
  const [isMobile] = useMediaQuery("(max-width: 500px)");

  const [haircutList, setHaircutList] = useState<HaircutsItem[]>(
    haircuts || []
  );
  const [disableHaircut, setDisableHaircut] = useState("enabled");

  async function handleDisable(isChecked: boolean) {
    try {
      const apiClient = setupAPIClient();
      setDisableHaircut(isChecked ? "enabled" : "disabled");

      const response = await apiClient.get("/haircuts", {
        params: {
          status: isChecked,
        },
      });

      setHaircutList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Head>
        <title>Cortes - BarberPro</title>
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
            mb={6}
            alignItems={isMobile ? "flex-start" : "center"}
            justifyContent="space-between"
          >
            <Heading
              fontSize={isMobile ? "28px" : "3xl"}
              mt={6}
              mb={6}
              mr={4}
              color="orange.900"
            >
              Modelo de Cortes
            </Heading>
            <Link href="/haircuts/new">
              <Button>Cadastrar novo corte</Button>
            </Link>

            <Stack direction="row" spacing={4}>
              <Text fontWeight={"bold"}>Ativos</Text>
              <Switch
                colorScheme="green"
                size="lg"
                isChecked={disableHaircut === "enabled"}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleDisable(e.target.checked)
                }
              />
            </Stack>
          </Flex>

          {haircutList.map((haircut) => (
            <Link
              key={haircut.id}
              href={`/haircuts/${haircut.id}`}
              style={{ width: "100%" }}
            >
              <Flex
                cursor={"pointer"}
                w="100%"
                p={4}
                bg="barber.400"
                direction={isMobile ? "column" : "row"}
                mb={2}
                rounded={6}
                justifyContent="space-between"
                alignItems={isMobile ? "flex-start" : "center"}
              >
                <Flex
                  mb={isMobile ? 2 : 0}
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                >
                  <IoMdPricetag size={28} color="#fba931" />
                  <Text fontWeight={"bold"} color="white" ml={4} noOfLines={2}>
                    {haircut.name}
                  </Text>
                </Flex>

                <Text fontWeight={"bold"} color="white">
                  Preço: R$ {Number(haircut.price).toFixed(2)}
                </Text>
              </Flex>
            </Link>
          ))}
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

    return {
      props: {
        haircuts: Array.isArray(response.data) ? response.data : [],
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
