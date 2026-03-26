"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";

import { useEvents } from "@/hooks/useEvent";
import { useAddEvent } from "@/hooks/useAddEvent";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { useUpdateEvent } from "@/hooks/useUpdateEvent";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";

// -----------------------------
// 型定義（ファイル内）
// -----------------------------
interface Event {
  id: string;
  user_id: string; // Supabase UUID
  title: string;
  memo: string;
  date: string; // yyyy-MM-dd
  start_time?: string; // HH:mm
  end_time?: string; // HH:mm
  created_at?: string;
  updated_at?: string;
}

interface TileProps {
  view: string;
  date: Date;
}

export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  const [title, setTitle] = useState<string>("");
  const [memo, setMemo] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editMemo, setEditMemo] = useState<string>("");

  const router = useRouter();
  const queryClient = useQueryClient();

  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: events = [] } = useEvents(formattedDate);
  const { data: allEvents = [] } = useEvents(""); // 全体取得

  const addEvent = useAddEvent();
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();

  // 🔐 認証チェック
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!data.session) {
          router.replace("/login");
        } else {
          setUser(data.session.user);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace("/login");
        else setUser(session.user);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // 🔄 リアルタイム同期
  useEffect(() => {
    const channel = supabase
      .channel("events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["events"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // ➕ 追加
  const handleAdd = async () => {
    if (!title || !user) return;

    try {
      await addEvent.mutateAsync({
        title,
        memo,
        date: formattedDate,
        user_id: user.id,
      });

      setTitle("");
      setMemo("");
    } catch (err) {
      const e = err as Error;
      alert(e.message);
    }
  };

  // ✏️ 編集
  const startEdit = (e: Event) => {
    setEditingId(e.id);
    setEditTitle(e.title);
    setEditMemo(e.memo);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      await updateEvent.mutateAsync({
        id: editingId,
        title: editTitle,
        memo: editMemo,
      });

      setEditingId(null);
    } catch (err) {
      const e = err as Error;
      alert(e.message);
    }
  };

  // 🔴 日付に●表示
  const eventDates = useMemo(() => {
    return new Set(allEvents.map((e: Event) => e.date));
  }, [allEvents]);

  const tileContent = ({ date, view }: TileProps) => {
    if (view !== "month") return null;

    const d = format(date, "yyyy-MM-dd");
    if (eventDates.has(d)) {
      return <div className="w-1.5 h-1.5 bg-black rounded-full mx-auto mt-1" />;
    }
    return null;
  };

  // 🚪 ログアウト
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } catch (err) {
      const e = err as Error;
      alert(e.message);
    }
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-lg">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight">共有カレンダー</h1>

          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-100 transition"
          >
            ログアウト
          </button>
        </div>

        {/* カレンダー */}
        <div className="bg-white rounded-2xl shadow p-4">
          <Calendar
            value={date}
            onChange={(d) => setDate(d as Date)}
            tileContent={tileContent}
          />
        </div>

        {/* 入力フォーム */}
        <div className="bg-white rounded-2xl shadow p-4 mt-4 space-y-3">
          <div className="relative">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder=" "
              className="peer border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            />
            <label
              className="absolute left-3 top-3 text-gray-400 text-sm transition-all 
              peer-focus:-top-2 peer-focus:text-xs peer-focus:text-black
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm"
            >
              タイトル
            </label>
          </div>

          <div className="relative">
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder=" "
              className="peer border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-black"
            />
            <label
              className="absolute left-3 top-3 text-gray-400 text-sm transition-all 
              peer-focus:-top-2 peer-focus:text-xs peer-focus:text-black
              peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm"
            >
              メモ
            </label>
          </div>

          <button
            onClick={handleAdd}
            className="bg-black text-white rounded-xl p-3 w-full hover:scale-[1.02] transition"
          >
            追加
          </button>
        </div>

        {/* 予定一覧 */}
        <div className="mt-4 space-y-2">
          {events.map((e: Event) => (
            <div
              key={e.id}
              className={`p-3 rounded-xl shadow bg-white ${
                e.user_id === user.id
                  ? "border-l-4 border-blue-400"
                  : "border-l-4 border-pink-400"
              }`}
            >
              {editingId === e.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="border p-1 w-full mb-1"
                  />
                  <textarea
                    value={editMemo}
                    onChange={(e) => setEditMemo(e.target.value)}
                    className="border p-1 w-full mb-1"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="bg-green-500 text-white px-2 rounded"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-500"
                    >
                      キャンセル
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-gray-500">{e.memo}</p>
                  <div className="flex gap-3 mt-2 text-sm">
                    <button
                      onClick={() => startEdit(e)}
                      className="text-blue-500"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("削除しますか？")) deleteEvent.mutate(e.id);
                      }}
                      className="text-red-500"
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
