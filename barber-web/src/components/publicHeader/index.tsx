import { useContext } from "react";
import { Flex, Text, Button } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthContext } from "@/src/context/AuthContext";

export function PublicHeader({
  actionHref = "/login",
  actionLabel = "Sou barbearia",
}: {
  actionHref?: string;
  actionLabel?: string;
}) {
  const router = useRouter();
  const { isAuthenticated, logoutUser } = useContext(AuthContext);

  async function handleExit() {
    if (isAuthenticated) {
      await logoutUser();
      return;
    }

    router.push("/login");
  }

  return (
    <Flex
      w="100%"
      maxW="800px"
      mx="auto"
      py={6}
      px={4}
      align="center"
      justify="space-between"
      gap={3}
    >
      <Link href="/agendar">
        <Flex cursor="pointer" userSelect="none" direction="row">
          <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
            Barber
          </Text>
          <Text
            fontSize="2xl"
            fontFamily="monospace"
            fontWeight="bold"
            color="button.cta"
          >
            PRO
          </Text>
        </Flex>
      </Link>
      <Flex align="center" gap={2}>
        <Button
          size="sm"
          variant="outline"
          color="white"
          borderColor="gray.600"
          _hover={{ bg: "barber.400" }}
          onClick={handleExit}
        >
          Sair
        </Button>
        <Link href={actionHref}>
          <Button
            as="span"
            size="sm"
            bg="button.cta"
            color="gray.900"
            _hover={{ bg: "#FFb13e" }}
            cursor="pointer"
          >
            {actionLabel}
          </Button>
        </Link>
      </Flex>
    </Flex>
  );
}
