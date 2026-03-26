"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Event, TileProps } from "@/type/type";

import {
  Stack,
  Paper,
  TextInput,
  Textarea,
  Button,
  Title,
  Text,
  Group,
} from "@mantine/core";

export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState(new Date());

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMemo, setEditMemo] = useState("");

  const router = useRouter();
  const queryClient = useQueryClient();

  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: events = [] } = useEvents(formattedDate);
  const { data: allEvents = [] } = useEvents(""); // 全体取得

  const addEvent = useAddEvent();
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();

  // 🔐 認証
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();

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
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // リアルタイム同期
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

  const handleAdd = async () => {
    if (!title || !user) return;

    await addEvent.mutateAsync({
      title,
      memo,
      date: formattedDate,
      user_id: user.id,
    });

    setTitle("");
    setMemo("");
  };

  const startEdit = (e: Event) => {
    setEditingId(e.id);
    setEditTitle(e.title);
    setEditMemo(e.memo);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    await updateEvent.mutateAsync({
      id: editingId,
      title: editTitle,
      memo: editMemo,
    });

    setEditingId(null);
  };

  const eventDates = useMemo(
    () => new Set(allEvents.map((e) => e.date)),
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!user)
    return (
      <Stack align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Text>Loading...</Text>
      </Stack>
    );

  return (
    <Stack p="md">
      <Group>
        <Title order={2}>共有カレンダー</Title>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          ログアウト
        </Button>
      </Group>

      <Paper shadow="xs" p="md">
        <Calendar
          value={date}
          onChange={(d) => setDate(d as Date)}
          tileContent={tileContent}
        />
      </Paper>

      <Paper shadow="xs" p="md">
        <TextInput
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          mb="sm"
        />
        <Textarea
          placeholder="メモ"
          value={memo}
          onChange={(e) => setMemo(e.currentTarget.value)}
          mb="sm"
        />
        <Button fullWidth onClick={handleAdd}>
          追加
        </Button>
      </Paper>

      {events.map((e: Event) => (
        <Paper key={e.id} shadow="xs" p="sm">
          {editingId === e.id ? (
            <Stack>
              <TextInput
                value={editTitle}
                onChange={(e) => setEditTitle(e.currentTarget.value)}
              />
              <Textarea
                value={editMemo}
                onChange={(e) => setEditMemo(e.currentTarget.value)}
              />
              <Group>
                <Button color="green" size="xs" onClick={handleUpdate}>
                  保存
                </Button>
                <Button
                  color="gray"
                  size="xs"
                  onClick={() => setEditingId(null)}
                >
                  キャンセル
                </Button>
              </Group>
            </Stack>
          ) : (
            <Stack>
              <Text style={{ fontWeight: "500" }}>{e.title}</Text>
              <Text size="sm" color="dimmed">
                {e.memo}
              </Text>
              <Group>
                <Button variant="subtle" size="xs" onClick={() => startEdit(e)}>
                  編集
                </Button>
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => {
                    if (confirm("削除しますか？")) deleteEvent.mutate(e.id);
                  }}
                >
                  削除
                </Button>
              </Group>
            </Stack>
          )}
        </Paper>
      ))}
    </Stack>
  );
}
