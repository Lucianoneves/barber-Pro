import { useState, useContext } from "react";
import Head from "next/head";
import Image from "next/image";
import { Flex, Center, Input, Button, Text } from "@chakra-ui/react";
import Link from "next/link";
import { AuthContext } from "@/src/context/AuthContext";

import { canSSRGuest } from "@/src/services/utils/canSSRGuest";

export default function Login() {
  const { signIn } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (email === "" || password === "") {
      return;
    }

    await signIn({
      email,
      password,
    });
  }

  return (
    <>
      <Head>
        <title>Barber-Pro - Faça login para Acessar</title>
      </Head>

      <Flex
        background="barber.900"
        height="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Flex width={640} direction="column" p={14} rounded={8}>
          <Center p={6}>
            <Image
              src="/images/logo.svg"
              alt="Barber-Pro"
              width={348}
              height={149}
              priority
            />
          </Center>

          <Input
            background="barber.400"
            variant="filled"
            size="lg"
            placeholder="E-mail"
            type="email"
            mb={3}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            color="white"
          />

          <Input
            background="barber.400"
            variant="filled"
            size="lg"
            placeholder="************"
            type="text"
            mb={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            color="white"
          />

          <Button
            background="button.cta"
            color="barber.900"
            fontWeight="bold"
            size="lg"
            _hover={{ background: "button.cta", opacity: 0.8 }}
            onClick={handleLogin}
          >
            Acessar
          </Button>

          <Link href="/agendar">
            <Button
              as="span"
              w="100%"
              mt={4}
              size="lg"
              variant="outline"
              color="white"
              borderColor="button.cta"
              _hover={{ bg: "barber.400" }}
              cursor="pointer"
            >
              Quero agendar um corte
            </Button>
          </Link>

          <Link href="/register">
            <Text
              cursor="pointer"
              color="button.default"
              fontSize={16}
              textAlign="center"
              mt={6}
            >
              Não tem uma conta? <strong>Cadastre sua barbearia</strong>
            </Text>
          </Link>
        </Flex>
      </Flex>
    </>
  );
}

export const getServerSideProps = canSSRGuest(async (ctx) => {
  //essa função é para verificar se o usuário está logado e redirecionar para a página de dashboard
  return {
    props: {},
  };
});
