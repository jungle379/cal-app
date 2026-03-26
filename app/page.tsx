"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/calendar");
      } else {
        router.replace("/login");
      }
    };

    check();
  }, [router]);

  return <div className="p-4">Loading...</div>;
}
