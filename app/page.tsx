"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    // ⏱ 保険：2秒で強制遷移（スマホ対策）
    const timeout = setTimeout(() => {
      if (!isMounted) return;
      console.log("timeout fallback → login");
      router.replace("/login");
    }, 2000);

    // 🔐 認証状態監視（これがメイン）
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      console.log("auth state changed:", session);

      clearTimeout(timeout);

      if (session) {
        router.replace("/calendar");
      } else {
        router.replace("/login");
      }
    });

    // 🔁 初回チェック（保険）
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      console.log("initial session:", session);

      if (session) {
        clearTimeout(timeout);
        router.replace("/calendar");
      }
    };

    init();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  );
}
