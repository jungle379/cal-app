"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const redirectUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/calendar"
        : "https://akikuma-hirokuma.vercel.app/calendar";

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("メールを送信しました");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow space-y-4">
        <h1 className="text-xl font-bold text-center">ログイン</h1>

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-black outline-none"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-black text-white p-3 w-full rounded-xl active:scale-95 transition disabled:opacity-50"
        >
          {loading ? "送信中..." : "ログイン"}
        </button>
      </div>
    </div>
  );
}
