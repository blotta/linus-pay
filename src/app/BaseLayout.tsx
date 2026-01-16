import Header from "@/components/Header";
import { Container } from "@chakra-ui/react";
import { Outlet } from "react-router";

export default function BaseLayout() {
  return (
    <>
      <Header />
      <Container py="5">
        <Outlet />
      </Container>
    </>
  );
}
