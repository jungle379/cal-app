"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      // Supabaseのセッション取得
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        // ログイン済みならカレンダーへ
        router.replace("/calendar");
      } else {
        // 未ログインならログインページへ
        router.replace("/login");
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  // 即リダイレクトなので Loading 表示は最小限
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );
}
