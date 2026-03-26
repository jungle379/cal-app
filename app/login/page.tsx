"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://aki-hiro.vercel.app/calendar",
      },
    });
    alert("メールを確認してください");
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-xl font-bold">ログイン</h1>

      <input
        type="email"
        placeholder="メール"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2"
      />

      <button onClick={handleLogin} className="bg-black text-white p-2">
        ログイン
      </button>
    </div>
  );
}
