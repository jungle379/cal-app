"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Stack, TextInput, Button, Title, Text } from "@mantine/core";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "https://aki-hiro.vercel.app/calendar",
        },
      });

      if (error) throw error;

      alert("メールを確認してください");
    } catch (err: unknown) {
      const e = err as Error;
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack
      align="center"
      style={{ minHeight: "100vh" }}
      justify="center"
      p="md"
    >
      <Title order={2}>ログイン</Title>

      <TextInput
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        style={{ width: "100%", maxWidth: 360 }}
      />

      <Button
        fullWidth
        style={{ maxWidth: 360 }}
        loading={loading}
        onClick={handleLogin}
      >
        ログイン
      </Button>

      <Text color="dimmed" size="sm">
        入力したメールアドレスにログインリンクを送信します
      </Text>
    </Stack>
  );
}
