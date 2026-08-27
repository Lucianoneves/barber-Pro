import { createContext, useState, useEffect, ReactNode } from "react";
import { destroyCookie, setCookie, parseCookies } from "nookies";
import Router from "next/router";
import { AxiosError } from "axios";
import { useToast } from "@chakra-ui/react";

import { api } from "../services/apiClient";

interface AuthContextData {
  user: UserProps | null;
  isAuthenticated: boolean;
  signIn: (credentials: SignInProps) => Promise<void>;
  signUp: (credentials: SignUpProps) => Promise<void>;
  logoutUser: () => Promise<void>;
}

interface UserProps {
  id: string;
  name: string;
  email: string;
  token: string;
  subscriptions: subscriptionsProps | null;
  endereco: string;
}

interface subscriptionsProps {
  id: string;
  status: boolean;
}

type AuthProviderProps = {
  children: ReactNode;
};

interface SignInProps {
  email: string;
  password: string;
}

interface SignUpProps {
  name: string;
  email: string;
  password: string;
}

export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  console.log("Error logout");

  try {
    //tenta destruir o cookie e redirecionar para a pagina de login
    destroyCookie(null, "@barber.token", { path: "/" });
    Router.push("/login");
  } catch (error) {
    console.log("Erro ao sair");
  }
}

function getApiErrorMessage(error: unknown, fallback: string) {
  //pega o erro da api e retorna uma mensagem de erro
  const axiosError = error as AxiosError<{ error?: string }>;
  return axiosError.response?.data?.error || fallback;
}

export function AuthProvider({ children }: AuthProviderProps) {
  //provider do contexto de autenticacao
  const [user, setUser] = useState<UserProps | null>(null);
  const isAuthenticated = !!user;
  const toast = useToast();

  useEffect(() => {
    const { "@barber.token": token } = parseCookies();

    if (token) {
      //se o token existe, pega os dados do usuario
      api
        .get("/me")
        .then((response) => {
          const { id, name, email, subscriptions, endereco } = response.data;
          setUser({
            id,
            name,
            email,
            token,
            endereco,
            subscriptions,
          });
        })

        .catch(() => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SignInProps) {
    try {
      const response = await api.post("/sessions", {
        email: email.trim().toLowerCase(),
        password,
      });
      const { id, name, token, subscriptions, endereco } = response.data;
      setCookie(undefined, "@barber.token", token, {
        maxAge: 60 * 60 * 24 * 30, //30 dias
        path: "/",
      });
      setUser({
        id,
        name,
        email,
        token,
        endereco,
        subscriptions,
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(error, "Erro ao entrar");
      toast({
        title: "Erro ao entrar",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }

  async function signUp({ name, email, password }: SignUpProps) {
    try {
      const response = await api.post("/users", {
        name,
        email: email.trim().toLowerCase(),
        password,
      });

      Router.push("/login");
    } catch (error) {
      const message = getApiErrorMessage(error, "Erro ao cadastrar");
      toast({
        title: "Erro ao cadastrar",
        description: message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }

  async function logoutUser() {
    try {
      destroyCookie(null, "@barber.token", { path: "/" });
      Router.push("/login");
      setUser(null);
    } catch (error) {
      console.log("error ao sair", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, signIn, signUp, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
