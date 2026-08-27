import { useState, useContext } from "react";
import Head from "next/head";
import Image from "next/image";
import { Flex, Center, Input, Button, Text } from "@chakra-ui/react";
import Link from "next/link";

import { AuthContext } from "../../context/AuthContext";

export default function Register() {
  const { signUp } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    if (name === "" || email === "" || password === "") {
      return;
    }

    await signUp({ name, email, password });
  }

  return (
    <>
      <Head>
        <title> Faça seu cadastro para Acessar</title>
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
            placeholder="Nome da Barbearia"
            type="text"
            mb={3}
            value={name}
            onChange={(e) => setName(e.target.value)}
            color="white"
          />

          <Input
            background="barber.400"
            variant="filled"
            size="lg"
            placeholder="E-mail"
            type="email"
            mb={6}
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
            onClick={handleRegister}
          >
            Acessar
          </Button>

          <Link href="/login">
            <Text
              cursor="pointer"
              color="button.default"
              fontSize={16}
              textAlign="center"
              mt={6}
            >
              Já possui uma conta? <strong>Faça login</strong>
            </Text>
          </Link>
        </Flex>
      </Flex>
    </>
  );
}
