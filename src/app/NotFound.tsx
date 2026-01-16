import {
  AbsoluteCenter,
  Button,
  Heading,
  Separator,
  VStack,
} from "@chakra-ui/react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <AbsoluteCenter>
      <VStack>
        <Heading size="4xl">Not Found</Heading>
        <Separator size="lg" colorPalette="white" />
        <Button asChild variant="outline">
          <Link to="/">Go to Dashboard</Link>
        </Button>
      </VStack>
    </AbsoluteCenter>
  );
}
