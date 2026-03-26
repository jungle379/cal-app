"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log("clicked");

    try {
      if (!email) {
        alert("メールアドレスを入力してください");
        return;
      }

      setLoading(true);

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: "https://aki-hiro.vercel.app/calendar",
        },
      });

      console.log("RESULT:", data, error);

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      alert("メールを送信しました");
    } catch (e) {
      console.error("ERROR:", e);
      alert("エラーが発生しました");
    } finally {
      setLoading(false);
    }
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
