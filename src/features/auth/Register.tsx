import { useState } from "react";

import { supabase } from "../../helper/supabaseClient";
import { Link as RouterLink, useNavigate } from "react-router";
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
  Spinner,
} from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (password !== passwordConfirm) {
      setMessage("Passwords don't match");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          avatar_url: null,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data) {
      const si = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (si.error) {
        setMessage(si.error.message);
      }
      console.log(si.data);
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <Center h="100vh">
      <Box p="10" shadow="lg" background="bg.subtle">
        <form onSubmit={handleSubmit}>
          <Stack gap="8">
            <Heading textAlign="center">Register</Heading>

            <Field.Root>
              <Field.Label>Name</Field.Label>
              <Input
                type="text"
                required
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </Field.Root>

            <Field.Root>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
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

            <Field.Root>
              <Field.Label>Confirm Password</Field.Label>
              <PasswordInput
                required
                onChange={(e) => setPasswordConfirm(e.target.value)}
                value={passwordConfirm}
              />
            </Field.Root>

            {message && (
              <Alert.Root status="error">
                <Alert.Title>{message}</Alert.Title>
              </Alert.Root>
            )}

            <Button disabled={loading} type="submit">
              {loading ? <Spinner /> : "Sign Up"}
            </Button>

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
