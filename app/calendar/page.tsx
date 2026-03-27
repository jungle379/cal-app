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
// 型定義
// -----------------------------
interface Event {
  id: string;
  user_id: string;
  title: string;
  memo: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface TileProps {
  view: string;
  date: Date;
}
// -----------------------------
export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<Date>(new Date());

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  // ⭐ 追加
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editStartTime, setEditStartTime] = useState("09:00");
  const [editEndTime, setEditEndTime] = useState("10:00");

  const router = useRouter();
  const queryClient = useQueryClient();

  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: events = [] } = useEvents(formattedDate);
  const { data: allEvents = [] } = useEvents("");

  const addEvent = useAddEvent();
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();

  // 🔐 認証
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
      } else {
        setUser(data.session.user);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.replace("/login");
      else setUser(session.user);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // 🔄 realtime
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

    await addEvent.mutateAsync({
      title,
      memo,
      date: formattedDate,
      user_id: user.id,
      start_time: startTime,
      end_time: endTime,
    });

    setTitle("");
    setMemo("");
  };

  // ✏️ 編集開始
  const startEdit = (e: Event) => {
    setEditingId(e.id);
    setEditTitle(e.title);
    setEditMemo(e.memo);
    setEditStartTime(e.start_time);
    setEditEndTime(e.end_time);
  };

  // ✏️ 更新
  const handleUpdate = async () => {
    if (!editingId) return;

    await updateEvent.mutateAsync({
      id: editingId,
      title: editTitle,
      memo: editMemo,
      start_time: editStartTime,
      end_time: editEndTime,
    });

    setEditingId(null);
  };

  // 🔴 日付マーク
  const eventDates = useMemo(
    () => new Set(allEvents.map((e: Event) => e.date)),
    [allEvents],
  );

  const tileContent = ({ date, view }: TileProps) => {
    if (view !== "month") return null;
    const d = format(date, "yyyy-MM-dd");
    if (eventDates.has(d)) {
      return <div className="w-1.5 h-1.5 bg-black rounded-full mx-auto mt-1" />;
    }
    return null;
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">共有カレンダー</h1>

      {/* カレンダー */}
      <Calendar
        value={date}
        onChange={(d) => setDate(d as Date)}
        tileContent={tileContent}
      />

      {/* 追加フォーム */}
      <div className="mt-4 space-y-2">
        <input
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full"
        />

        <textarea
          placeholder="メモ"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="border p-2 w-full"
        />

        {/* ⭐ 時間 */}
        <div className="flex gap-2">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <button onClick={handleAdd} className="bg-black text-white p-2 w-full">
          追加
        </button>
      </div>

      {/* 一覧 */}
      <div className="mt-4 space-y-2">
        {events.map((e: Event) => (
          <div key={e.id} className="border p-2 rounded">
            {editingId === e.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border p-1 w-full"
                />

                <textarea
                  value={editMemo}
                  onChange={(e) => setEditMemo(e.target.value)}
                  className="border p-1 w-full"
                />

                <div className="flex gap-2">
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="border p-1 w-full"
                  />
                  <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="border p-1 w-full"
                  />
                </div>

                <button onClick={handleUpdate}>保存</button>
              </>
            ) : (
              <>
                <p className="font-bold">{e.title}</p>
                <p>{e.memo}</p>
                <p className="text-sm text-gray-500">
                  {e.start_time} - {e.end_time}
                </p>

                <button onClick={() => startEdit(e)}>編集</button>
                <button onClick={() => deleteEvent.mutate(e.id)}>削除</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
