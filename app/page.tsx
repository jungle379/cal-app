"use client";

import { Button, Container, Title, Center, Box,Image } from "@mantine/core";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <Box mih="100dvh" style={{ position: "relative" }}>
      {/* 上部: タイトル */}
      <Container size="sm" py="xl">
        <Title order={1} style={{ textAlign: "center" }}>
          共有カレンダー
        </Title>
      </Container>

            <Container size="sm" py="xl" style={{ display: "flex", justifyContent: "center", height: "200px",width: "200px"  }}>
          <Image
      radius="md"
      height="auto"
      fit="contain"
      width="auto"
      src="/icon-192.png"
    />
      </Container>

      {/* 画面の高さ: 半分より少し下（例: 55%） */}
      <Center
        style={{
          position: "absolute",
          insetInline: 0,
          top: "55%",
          transform: "translateY(-50%)",
        }}
      >
        <Container size="sm" style={{ display: "flex", justifyContent: "center" }}>
          <Button size="md" onClick={() => router.push("/calendar")}>
            カレンダーを開く
          </Button>
        </Container>
      </Center>
    </Box>
  );
}
