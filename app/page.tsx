"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  // 未ログインならログインページへ
  router.push("/login");

  // 即リダイレクトなので Loading 表示は最小限
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  );
}
