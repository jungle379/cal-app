"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email) return alert("メールを入力してください");

    setLoading(true);

    try {
      const redirectUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/calendar"
          : "https://aki-hiro.vercel.app/calendar";

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) throw error;

      alert("メールを送信しました。リンクをクリックしてログインしてください。");
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Error型の場合は message を安全に参照可能
        alert(error.message);
      } else {
        // それ以外の場合の保険
        alert("予期しないエラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">ログイン</h1>

      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-3 rounded-lg w-full max-w-xs mb-4 focus:outline-none focus:ring-2 focus:ring-black"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-black text-white p-3 rounded-lg w-full max-w-xs active:scale-95 transition disabled:opacity-50"
      >
        {loading ? "送信中…" : "ログインリンクを送る"}
      </button>
    </div>
  );
}
