"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    // ⏱ フォールバック
    const timeout = setTimeout(() => {
      if (!isMounted) return;
      router.replace("/login");
    }, 2000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      clearTimeout(timeout);

      if (!session) {
        router.replace("/login");
      } else {
        setUser(session.user);
      }
    });

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session) {
        clearTimeout(timeout);
        setUser(session.user);
      }
    };

    init();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">カレンダー</h1>

        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1.5 rounded-lg border"
        >
          ログアウト
        </button>
      </div>

      <div>ログイン成功 🎉</div>
    </div>
  );
}
