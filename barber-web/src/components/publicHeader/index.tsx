import { Flex, Text, Button } from "@chakra-ui/react";
import Link from "next/link";

export function PublicHeader({
  actionHref = "/login",
  actionLabel = "Sou barbearia",
}: {
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Flex
      w="100%"
      maxW="800px"
      mx="auto"
      py={6}
      px={4}
      align="center"
      justify="space-between"
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
  );
}
