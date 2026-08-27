import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";

import { FiUser, FiScissors, FiCalendar, FiPhone } from "react-icons/fi";
import { FaMoneyBillAlt } from "react-icons/fa";
import {
  SchudelItem,
  formatScheduleDateTime,
} from "../../pages/dashboard/index";

interface ModalInfoProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  data: SchudelItem;
  finishService: () => Promise<void>;
}

export function ModalInfo({
  isOpen,
  onOpen,
  onClose,
  data,
  finishService,
}: ModalInfoProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="barber.400">
        <ModalHeader>Próximo </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <Flex align="center" mb={3}>
            <FiUser size={24} color="#FFB13e" />
            <Text ml={2} fontSize="2xl" fontWeight="bold" color="white">
              {data?.client?.name || data?.customer}
            </Text>
          </Flex>
          {data?.client?.phone && (
            <Flex align="center" mb={3}>
              <FiPhone size={24} color="#FFF" />
              <Text ml={2} fontSize="large" fontWeight="bold" color="white">
                {data.client.phone}
              </Text>
            </Flex>
          )}
          <Flex align="center" mb={3}>
            <FiScissors size={24} color="#FFF" />
            <Text ml={2} fontSize="large" fontWeight="bold" color="white">
              {data?.haircut?.name}
            </Text>
          </Flex>
          <Flex align="center" mb={3}>
            <FiCalendar size={24} color="#FFB13e" />
            <Text ml={2} fontSize="large" fontWeight="bold" color="white">
              {formatScheduleDateTime(data?.scheduled_at)}
            </Text>
          </Flex>
          <Flex align="center" mb={3}>
            <FaMoneyBillAlt size={24} color="#46ef75" />
            <Text ml={2} fontSize="large" fontWeight="bold" color="white">
              R$ {data?.haircut?.price}
            </Text>
          </Flex>

          <ModalFooter>
            <Button
              bg="button.cta"
              _hover={{ bg: "#FFb13e" }}
              color="#FFF"
              mr={3}
              onClick={() => finishService()}
            >
              Finalizar Serviço
            </Button>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
