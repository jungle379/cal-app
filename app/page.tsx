"use client";

import { Button, Container, Title, Stack } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <Container size="sm" py="xl">
      <Stack py="lg" align="center">
        <Title order={1}>共有カレンダー</Title>
        <Button onClick={() => router.push("/calendar")}>
          カレンダーを開く
        </Button>
      </Stack>
    </Container>
  );
}
