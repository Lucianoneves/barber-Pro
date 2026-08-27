import { useContext, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Flex,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Box,
  Divider,
  Button,
  useToast,
  useDisclosure,
  Input,
} from "@chakra-ui/react";
import { Sidebar } from "@/src/components/sidebar";
import { canSSRAuth } from "../../services/utils/canSSRAuth";
import { AuthContext } from "../../context/AuthContext";
import { setupAPIClient } from "../../services/api";

interface UserProps {
  id: string;
  name: string;
  email: string;
  endereco: string | null;
  slug: string;
}

interface ProfileProps {
  user: UserProps;
  premium: boolean;
}

export default function Profile({ user, premium }: ProfileProps) {
  const { logoutUser } = useContext(AuthContext);

  const [name, setName] = useState(user && user.name);
  const [endereco, setEndereco] = useState(
    user?.endereco ? user?.endereco : ""
  );

  async function handleLogout() {
    await logoutUser();
  }

  async function handleUpdateUser() {
    if (name === "") {
      return;
    }

    try {
      const apiClient = setupAPIClient();
      await apiClient.put("/users", {
        name: name,
        endereco: endereco,
      });
      alert("Dados alterados com sucesso");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Head>
        <title> Minha Conta - BarberPro</title>
      </Head>
      <Sidebar>
        <Flex direction="column" w="100%" maxW="800px" mx="auto">
          <Heading fontSize="2xl" mt={6} mb={6} mr={4} color="orange.900">
            {" "}
            Minha Conta
          </Heading>
        </Flex>

        <Flex
          pt={8}
          pb={8}
          background="barber.400"
          direction="column"
          w="100%"
          maxW="800px"
          mx="auto"
          align="center"
          justify="center"
        >
          <Flex direction="column" w="85%">
            <Text mb={2} fontSize="xl" fontWeight="bold" color="white">
              Nome da barbearia:
            </Text>
            <Input
              w="100%"
              background="gray.900"
              placeholder="Digite o nome da barbearia"
              size="lg"
              type="text"
              mb={4}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Text mb={2} fontSize="xl" fontWeight="bold" color="white">
              Endereço:
            </Text>
            <Input
              w="100%"
              background="gray.900"
              placeholder="Digite o endereço da barbearia"
              size="lg"
              type="text"
              mb={4}
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />

            <Text mb={2} fontSize="xl" fontWeight="bold" color="white">
              Link de agendamento:
            </Text>
            <Input
              w="100%"
              background="gray.900"
              size="lg"
              type="text"
              mb={4}
              value={`/agendar/${user.slug}`}
              isReadOnly
            />
            <Text mb={2} fontSize="xl" fontWeight="bold" color="white">
              Plano Atual:
            </Text>
            <Flex
              direction="row"
              w="100%"
              mb={4}
              p={1}
              borderWidth={1}
              rounded={6}
              background="barber.900"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text
                p={2}
                fontSize="lg"
                fontWeight="bold"
                color={premium ? "#FBA931" : "#4dffb4"}
              >
                {premium ? "Plano Premium" : " Plano Grátis"}
              </Text>

              <Link href="/planos">
                <Box
                  cursor="pointer"
                  p={2}
                  pl={2}
                  background="#00cd52"
                  rounded={6}
                  color="white"
                >
                  Mudar de plano
                </Box>
              </Link>
            </Flex>

            <Button
              w="100%"
              bg="button.cta"
              color="white"
              size="lg"
              mt={4}
              mb={4}
              _hover={{ bg: "#ffb13e" }}
              onClick={() => handleUpdateUser()}
            >
              Salvar
            </Button>

            <Button
              w="100%"
              bg="transparent"
              borderWidth={2}
              borderColor="red.500"
              color="red.500"
              size="lg"
              mt={4}
              mb={6}
              _hover={{ bg: "transparent" }}
              onClick={() => handleLogout()}
            >
              Sair da conta
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
    const response = await apiClient.get("/me");

    const user = {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      endereco: response.data?.endereco,
      slug: response.data?.slug,
    };

    return {
      props: {
        user: user,
        premium:
          response.data?.subscriptions?.status === "active" ? true : false,
      },
    };
  } catch {
    console.log("Erro ao acessar a página de perfil");
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
});
