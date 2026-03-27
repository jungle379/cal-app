"use client";

import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";

import {
  Button,
  TextInput,
  Textarea,
  Select,
  Stack,
  Group,
  Card,
  Title,
} from "@mantine/core";

import { useEvents } from "@/hooks/useEvent";
import { useAddEvent } from "@/hooks/useAddEvent";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { useUpdateEvent } from "@/hooks/useUpdateEvent";

// -----------------------------
// 型定義
// -----------------------------
interface Event {
  id: string;
  user_id: "hiro" | "aki";
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
  const [date, setDate] = useState<Date>(new Date());

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [eventUser, setEventUser] = useState<"hiro" | "aki">("aki");

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [editingId, setEditingId] = useState<string | null>(null);

  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: events = [] } = useEvents(formattedDate);
  const { data: allEvents = [] } = useEvents("");

  const addEvent = useAddEvent();
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();

  // 🔴 日付マーク
  const eventDates = useMemo(
    () => new Set(allEvents.map((e: Event) => e.date)),
    [allEvents],
  );

  const tileContent = ({ date, view }: TileProps) => {
    if (view !== "month") return null;
    const d = format(date, "yyyy-MM-dd");
    if (eventDates.has(d)) {
      return <div style={{ textAlign: "center" }}>●</div>;
    }
    return null;
  };

  // ➕ 追加
  const handleAdd = async () => {
    if (!title) return;

    await addEvent.mutateAsync({
      title,
      memo,
      date: formattedDate,
      user_id: eventUser,
      start_time: startTime,
      end_time: endTime,
    });

    setTitle("");
    setMemo("");
  };

  // ✏️ 編集開始
  const startEdit = (e: Event) => {
    setEditingId(e.id);
    setTitle(e.title);
    setMemo(e.memo);
    setStartTime(e.start_time);
    setEndTime(e.end_time);
    setEventUser(e.user_id);
  };

  // ✏️ 更新
  const handleUpdate = async () => {
    if (!editingId) return;

    await updateEvent.mutateAsync({
      id: editingId,
      title,
      memo,
      user_id: eventUser,
      start_time: startTime,
      end_time: endTime,
    });

    setEditingId(null);
    setTitle("");
    setMemo("");
  };

  return (
    <Stack p="md" maw={500} mx="auto">
      <Title order={2}>共有カレンダー</Title>

      {/* カレンダー */}
      <Calendar
        value={date}
        onChange={(d) => setDate(d as Date)}
        tileContent={tileContent}
      />

      {/* 入力 */}
      <Card shadow="sm" p="md">
        <Stack>
          <TextInput
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />

          <Textarea
            placeholder="メモ"
            value={memo}
            onChange={(e) => setMemo(e.currentTarget.value)}
          />

          <Select
            label="ユーザー"
            value={eventUser}
            onChange={(v) => v && setEventUser(v as "hiro" | "aki")}
            data={[
              { value: "hiro", label: "ひろくま（青）" },
              { value: "aki", label: "あきくま（ピンク）" },
            ]}
          />

          <Group grow>
            <TextInput
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.currentTarget.value)}
            />
            <TextInput
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.currentTarget.value)}
            />
          </Group>

          <Button onClick={editingId ? handleUpdate : handleAdd}>
            {editingId ? "更新" : "追加"}
          </Button>
        </Stack>
      </Card>

      {/* 一覧 */}
      <Stack>
        {events.map((e: Event) => (
          <Card
            key={e.id}
            shadow="xs"
            p="md"
            style={{
              borderLeft: `5px solid ${
                e.user_id === "hiro" ? "#228be6" : "#fa5252"
              }`,
            }}
          >
            <Title order={5}>{e.title}</Title>
            <div>{e.memo}</div>
            <div>
              {e.start_time} - {e.end_time}
            </div>

            <Group mt="sm">
              <Button size="xs" onClick={() => startEdit(e)}>
                編集
              </Button>
              <Button
                size="xs"
                color="red"
                onClick={() => deleteEvent.mutate(e.id)}
              >
                削除
              </Button>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
