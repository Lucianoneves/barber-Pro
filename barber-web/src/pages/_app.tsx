import { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AuthProvider } from "@/src/context/AuthContext";

const colors = {
  barber: {
    900: "#12131b",
    400: "#1b1c29",
    100: "#c6c6c6",
  },
  button: {
    cta: "#fba931",
    default: "#DFDFDF",
    gray: "#FF4848",
  },
  orange: {
    900: "#fba931",
  },
};

const theme = extendTheme({
  colors,
  styles: {
    global: {
      body: {
        bg: "barber.900",
        color: "barber.100",
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp;
