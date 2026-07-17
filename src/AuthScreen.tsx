import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { api, ApiError } from "./api";
import type { Session } from "./types/Modelo";

interface AuthScreenProps {
  onAuthenticated: (session: Session) => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "register") await api.register({ nome, email, senha });
      onAuthenticated(await api.login({ email, senha }));
    } catch (requestError) {
      setError(
        requestError instanceof ApiError
          ? requestError.message
          : "Não foi possível acessar o servidor",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const changeMode = () => {
    setMode((current) => (current === "login" ? "register" : "login"));
    setError("");
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="#111211" color="#e8e9e6" px="4" py="10">
      <Box w="full" maxW="420px">
        <Flex align="center" gap="3" mb="8">
          <Flex align="center" justify="center" boxSize="9" borderRadius="md" bg="#9dbb92" color="#142014" fontWeight="bold">
            H
          </Flex>
          <Box>
            <Text fontWeight="semibold">habit space</Text>
            <Text fontSize="xs" color="#8f938c">seu ritmo, com calma</Text>
          </Box>
        </Flex>

        <Box borderWidth="1px" borderColor="#30322f" borderRadius="lg" bg="#191a18" p={{ base: "5", sm: "7" }}>
          <Heading as="h1" size="lg" letterSpacing="-0.03em">
            {mode === "login" ? "Entre no seu espaço" : "Crie seu espaço"}
          </Heading>
          <Text mt="2" mb="6" color="#8f938c" fontSize="sm">
            {mode === "login"
              ? "Continue acompanhando seus pequenos compromissos."
              : "Comece com poucos hábitos e construa seu ritmo."}
          </Text>

          <form onSubmit={submit}>
            <Stack gap="4">
              {mode === "register" && (
                <Box>
                  <label className="field-label" htmlFor="nome">Nome</label>
                  <Input id="nome" value={nome} onChange={(event) => setNome(event.target.value)} autoComplete="name" required minLength={2} disabled={submitting} bg="#141513" borderColor="#3a3d38" />
                </Box>
              )}
              <Box>
                <label className="field-label" htmlFor="email">E-mail</label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required disabled={submitting} bg="#141513" borderColor="#3a3d38" />
              </Box>
              <Box>
                <label className="field-label" htmlFor="senha">Senha</label>
                <Input id="senha" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 6 : 1} disabled={submitting} bg="#141513" borderColor="#3a3d38" />
              </Box>

              {error && (
                <Box role="alert" borderWidth="1px" borderColor="#693b37" bg="#352222" color="#f1b4ad" borderRadius="md" px="3" py="2.5" fontSize="sm">
                  {error}
                </Box>
              )}

              <Button type="submit" colorPalette="green" loading={submitting} disabled={submitting} w="full">
                {mode === "login" ? "Entrar" : "Criar conta"}
              </Button>
            </Stack>
          </form>

          <Text mt="5" textAlign="center" fontSize="sm" color="#8f938c">
            {mode === "login" ? "Ainda não tem uma conta?" : "Já tem uma conta?"}{" "}
            <Button variant="plain" size="sm" color="#a9c99e" px="1" onClick={changeMode} disabled={submitting}>
              {mode === "login" ? "Cadastre-se" : "Entre"}
            </Button>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
