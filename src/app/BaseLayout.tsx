import Header from "@/components/Header";
import { Container, Flex } from "@chakra-ui/react";
import { Outlet } from "react-router";

export default function BaseLayout() {
  return (
    <Flex direction="column" h="100vh">
      <Header />
      <Container
        fluid={{ base: false, smDown: true }}
        px={{ base: "auto", smDown: 0 }}
        py={{ sm: "5" }}
        pb={{ smDown: 0 }}
        flex="1"
        overflowY="auto"
      >
        <Outlet />
      </Container>
    </Flex>
  );
}
