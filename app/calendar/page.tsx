"use client";

import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import {
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  Group,
  Stack,
  Title,
  Box,
} from "@mantine/core";
import { useAddEvent } from "@/hooks/useAddEvent";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { useEvents } from "@/hooks/useEvent";
import { useUpdateEvent } from "@/hooks/useUpdateEvent";

// -----------------------------
// 型定義
// -----------------------------
interface Event {
  id: string;
  user_id: string; // UUID
  title: string;
  memo: string;
  date: string; // yyyy-MM-dd
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  created_at?: string;
  updated_at?: string;
}

// Supabase insert 用型
type EventInput = Omit<Event, "id" | "created_at" | "updated_at">;

type TileProps = {
  date: Date;
  view: "month" | "year" | "decade" | "century";
};

// -----------------------------
// カレンダーページ
// -----------------------------
export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalOpened, setModalOpened] = useState(false);

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [eventUser, setEventUser] = useState(""); // UUID文字列

  const formattedDate = format(date, "yyyy-MM-dd");
  const { data: events = [] } = useEvents(formattedDate);
  const { data: allEvents = [] } = useEvents("");

  const addEvent = useAddEvent();
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();

  // 日付に●を表示
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

  // 型安全な onChange
  const handleDateChange = (value: Date | Date[] | null) => {
    if (!value) return;
    if (value instanceof Date) setDate(value);
    else if (Array.isArray(value) && value[0] instanceof Date)
      setDate(value[0]);
  };

  // 予定追加
  const handleAdd = async () => {
    if (!title || !eventUser) return;
    const input: EventInput = {
      title,
      memo,
      date: formattedDate,
      start_time: "09:00", // 仮固定
      end_time: "10:00", // 仮固定
      user_id: eventUser, // UUID
    };
    await addEvent.mutateAsync(input);
    setTitle("");
    setMemo("");
  };

  // モーダル開く（編集）
  const openEditModal = (e: Event) => {
    setSelectedEvent(e);
    setTitle(e.title);
    setMemo(e.memo);
    setEventUser(e.user_id);
    setModalOpened(true);
  };

  // 予定更新
  const handleUpdate = async () => {
    if (!selectedEvent) return;

    const updateData: EventInput & { id: string } = {
      id: selectedEvent.id,
      title,
      memo,
      user_id: eventUser, // UUID
      date: selectedEvent.date,
      start_time: selectedEvent.start_time,
      end_time: selectedEvent.end_time,
    };
    await updateEvent.mutateAsync(updateData);
    setModalOpened(false);
  };

  // 予定削除
  const handleDelete = async () => {
    if (!selectedEvent) return;
    await deleteEvent.mutate(selectedEvent.id);
    setModalOpened(false);
  };

  return (
    <Box p="md" style={{ maxWidth: 600, margin: "0 auto" }}>
      <Title mb="md" order={2}>
        共有カレンダー
      </Title>

      {/* カレンダー */}
      <Calendar
        value={date}
        onChange={
          handleDateChange as unknown as typeof Calendar.prototype.onChange
        }
        tileContent={tileContent}
      />

      {/* 予定追加 */}
      <Stack gap="sm" mt="md">
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
          onChange={(val) => val && setEventUser(val)}
          data={[
            { value: "UUID_HIRO", label: "ひろくま" },
            { value: "UUID_AKI", label: "あきくま" },
          ]}
        />
        <Button fullWidth onClick={handleAdd}>
          追加
        </Button>
      </Stack>

      {/* 予定一覧 */}
      <Stack gap="sm" mt="md">
        {events.map((e) => (
          <Box
            key={e.id}
            p="sm"
            style={{
              backgroundColor:
                e.user_id === "UUID_HIRO" ? "#d0ebff" : "#ffd6d6",
              borderRadius: 8,
            }}
            onClick={() => openEditModal(e)}
          >
            <strong>{e.title}</strong>
            <div>{e.memo}</div>
          </Box>
        ))}
      </Stack>

      {/* 編集モーダル */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="予定編集"
      >
        <Stack gap="sm">
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
            onChange={(val) => val && setEventUser(val)}
            data={[
              { value: "UUID_HIRO", label: "ひろくま" },
              { value: "UUID_AKI", label: "あきくま" },
            ]}
          />
          <Group justify="apart">
            <Button color="red" onClick={handleDelete}>
              削除
            </Button>
            <Button onClick={handleUpdate}>保存</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
