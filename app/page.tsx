"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function HomePage() {
  const [, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session?.user) {
        setUser(data.session.user);
        router.replace("/calendar");
      } else {
        setUser(null);
        router.replace("/login");
      }
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        router.replace("/calendar");
      } else {
        setUser(null);
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  );
}
