"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Stack, Loader, Text } from "@mantine/core";
import { User } from "@supabase/supabase-js";

export default function RootPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
      } else {
        setUser(data.session.user);
        router.replace("/calendar");
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace("/login");
        } else {
          setUser(session.user);
          router.replace("/calendar");
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (user === undefined) {
    return (
      <Stack align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Loader size="lg" />
        <Text color="dimmed">Loading...</Text>
      </Stack>
    );
  }

  return null; // すぐに /calendar へリダイレクトされる
}
