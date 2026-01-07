import { useState } from "react";

import { supabase } from "../helper/supabaseClient";
import { Link as RouterLink } from "react-router";
import {
  Alert,
  Box,
  Button,
  Center,
  Field,
  Heading,
  Input,
  Stack,
  Link as ChakraLink,
} from "@chakra-ui/react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      setMessage("User account created!");
    }
  };

  return (
    <Center h="100vh">
      <Box p="10" shadow="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="10">
            <Heading textAlign="center">Register</Heading>

            {message && (
              <Alert.Root status="error">
                <Alert.Title>{message}</Alert.Title>
              </Alert.Root>
            )}

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
              <Input
                type="password"
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
            </Field.Root>
            <Button type="submit">Sign Up</Button>

            <ChakraLink asChild>
              <RouterLink to="/login">
                Already have an account? Log in
              </RouterLink>
            </ChakraLink>
          </Stack>
        </form>
      </Box>
    </Center>
  );
}
