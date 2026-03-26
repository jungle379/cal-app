"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) return alert("メールアドレスを入力してください");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "https://akikuma-hirokuma.vercel.app/calendar",
        },
      });
      if (error) throw error;
      alert("メールを確認してください");
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("予期せぬエラーです");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-bold">ログイン</h1>
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-xl hover:scale-[1.02] transition"
        >
          {loading ? "送信中..." : "ログインリンクを送信"}
        </button>
      </div>
    </div>
  );
}
