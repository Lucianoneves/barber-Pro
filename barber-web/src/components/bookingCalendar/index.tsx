import { useMemo, useState } from "react";
import { Button, Flex, Grid, IconButton, Text } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function toInput(value: Date) {
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

interface BookingCalendarProps {
  value: string;
  minDate: string;
  closedWeekdays: number[];
  onChange: (date: string) => void;
}

export function BookingCalendar({
  value,
  minDate,
  closedWeekdays,
  onChange,
}: BookingCalendarProps) {
  const selected = value ? new Date(`${value}T12:00:00`) : new Date();
  const min = startOfDay(new Date(`${minDate}T12:00:00`));
  const [visible, setVisible] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1)
  );

  const days = useMemo(() => {
    const firstWeekday = new Date(
      visible.getFullYear(),
      visible.getMonth(),
      1
    ).getDay();
    const daysInMonth = new Date(
      visible.getFullYear(),
      visible.getMonth() + 1,
      0
    ).getDate();
    const cells: Array<{ date: Date | null }> = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ date: null });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        date: new Date(visible.getFullYear(), visible.getMonth(), day),
      });
    }

    return cells;
  }, [visible]);

  const canGoPrev =
    visible.getFullYear() > min.getFullYear() ||
    (visible.getFullYear() === min.getFullYear() &&
      visible.getMonth() > min.getMonth());

  return (
    <Flex
      w="100%"
      direction="column"
      bg="barber.900"
      borderWidth={1}
      borderColor="gray.700"
      rounded={8}
      p={4}
    >
      <Flex align="center" justify="space-between" mb={4}>
        <IconButton
          aria-label="Mês anterior"
          icon={<FiChevronLeft />}
          size="sm"
          bg="barber.400"
          color="white"
          isDisabled={!canGoPrev}
          onClick={() =>
            setVisible(
              new Date(visible.getFullYear(), visible.getMonth() - 1, 1)
            )
          }
        />
        <Text fontWeight="bold" color="white">
          {MONTHS[visible.getMonth()]} {visible.getFullYear()}
        </Text>
        <IconButton
          aria-label="Próximo mês"
          icon={<FiChevronRight />}
          size="sm"
          bg="barber.400"
          color="white"
          onClick={() =>
            setVisible(
              new Date(visible.getFullYear(), visible.getMonth() + 1, 1)
            )
          }
        />
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1}>
        {WEEKDAY_SHORT.map((label) => (
          <Text
            key={label}
            textAlign="center"
            fontSize="xs"
            color="gray.500"
            fontWeight="bold"
          >
            {label}
          </Text>
        ))}
      </Grid>

      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {days.map((cell, index) => {
          if (!cell.date) {
            return <Flex key={`empty-${index}`} minH="40px" />;
          }

          const iso = toInput(cell.date);
          const isSelected = iso === value;
          const isPast = startOfDay(cell.date) < min;
          const isClosed = closedWeekdays.includes(cell.date.getDay());
          const disabled = isPast || isClosed;

          return (
            <Button
              key={iso}
              size="sm"
              minH="40px"
              p={0}
              fontSize="sm"
              bg={isSelected ? "button.cta" : "transparent"}
              color={
                isSelected ? "gray.900" : disabled ? "gray.600" : "white"
              }
              textDecoration={isClosed && !isSelected ? "line-through" : "none"}
              isDisabled={disabled}
              _hover={{
                bg: disabled ? "transparent" : isSelected ? "#FFb13e" : "barber.400",
              }}
              onClick={() => onChange(iso)}
            >
              {cell.date.getDate()}
            </Button>
          );
        })}
      </Grid>
    </Flex>
  );
}
