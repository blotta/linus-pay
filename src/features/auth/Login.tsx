import { useState } from "react";

import { Link as RouterLink } from "react-router";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  Center,
  Heading,
  Input,
  Stack,
  Link as ChakraLink,
  Field,
  Alert,
  Spinner,
} from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { supabase } from "@/helper/supabaseClient";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      navigate("/");
    }
  };

  return (
    <Center h="100vh">
      <Box p="10" shadow="lg" background="bg.subtle">
        <form onSubmit={handleSubmit}>
          <Stack gap="8">
            <Heading textAlign="center">Log In</Heading>

            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                placeholder="Email"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Password</Field.Label>
              <PasswordInput
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </Field.Root>

            {message && (
              <Alert.Root status="error">
                <Alert.Title>{message}</Alert.Title>
              </Alert.Root>
            )}

            <Button disabled={loading} type="submit">
              {loading ? <Spinner /> : "Log in"}
            </Button>

            <ChakraLink asChild>
              <RouterLink to="/register">
                Don't have an account? Sign up
              </RouterLink>
            </ChakraLink>
          </Stack>
        </form>
      </Box>
    </Center>
  );
}
