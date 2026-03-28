"use client";

import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import {
  Modal,
  Badge,
  Button,
  TextInput,
  Textarea,
  Select,
  Stack,
  Group,
  Card,
  Title,
  Box,
  Notification,
} from "@mantine/core";
import { useEvents } from "@/hooks/useEvent";
import { useAddEvent } from "@/hooks/useAddEvent";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { useUpdateEvent } from "@/hooks/useUpdateEvent";
import z from "zod";

export const metadata = {
  title: "2人のカレンダー",
};

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
// -----------------------------
// Zodスキーマ
// -----------------------------
const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "タイトルは必須です")
      .max(50, "タイトルは50文字以内です"),

    memo: z.string().max(200, "メモは200文字以内です").optional(),

    start_time: z.string().regex(/^\d{2}:\d{2}$/, "時間形式が不正です"),

    end_time: z.string().regex(/^\d{2}:\d{2}$/, "時間形式が不正です"),

    user_id: z.enum(["hiro", "aki"]),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "終了時間は開始時間より後にしてください",
    path: ["end_time"],
  });

// -----------------------------
export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [eventUser, setEventUser] = useState<"hiro" | "aki">("aki");

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [opened, setOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

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

  // バリデーション関数
  const validate = () => {
    const result = eventSchema.safeParse({
      title,
      memo,
      start_time: startTime,
      end_time: endTime,
      user_id: eventUser,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const key = err.path[0] as string;
        if (key) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // ➕ 追加
  const handleAdd = async () => {
    if (!validate()) return;

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
    setStartTime("09:00");
    setEndTime("10:00");
    setToast("予定を追加しました。");
  };

  // ✏️ モーダル開く
  const openModal = (e: Event) => {
    setSelectedEvent(e);
    setTitle(e.title);
    setMemo(e.memo);
    setStartTime(e.start_time);
    setEndTime(e.end_time);
    setEventUser(e.user_id);
    setOpened(true);
  };
  const closeModal = () => {
    setTitle("");
    setMemo("");
    setStartTime("09:00");
    setEndTime("10:00");
    setOpened(false);
  };

  // ❌ 削除モーダル
  const openDeleteModal = (e: Event) => {
    setSelectedEvent(e);
    setDeleteOpened(true);
  };

  // ✏️ 更新
  const handleUpdate = async () => {
    if (!selectedEvent) return;
    if (!validate()) return;

    await updateEvent.mutateAsync({
      id: selectedEvent.id,
      title,
      memo,
      user_id: eventUser,
      start_time: startTime,
      end_time: endTime,
    });

    setOpened(false);
    setTitle("");
    setMemo("");
    setStartTime("09:00");
    setEndTime("10:00");
    setToast("予定を更新しました。");
  };

  // 🗑 削除
  const handleDelete = async () => {
    if (!selectedEvent) return;

    deleteEvent.mutate(selectedEvent.id);
    setDeleteOpened(false);
    setOpened(false);
    setTitle("");
    setMemo("");
    setStartTime("09:00");
    setEndTime("10:00");
    setToast("予定を削除しました。");
  };

  // ⏰ ソート
  const sortedEvents = [...events].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  return (
    <Stack p="md" maw={500} mx="auto">
      <Title order={2}>共有カレンダー</Title>

      {toast && (
        <Notification color="teal" onClose={() => setToast(null)}>
          {toast}
        </Notification>
      )}

      {/* カレンダー */}
      <Calendar
        value={date}
        onChange={(d) => setDate(d as Date)}
        tileContent={tileContent}
      />

      {/* 追加フォーム */}
      <Card shadow="sm" p="md">
        <Stack>
          <TextInput
            placeholder="タイトル"
            value={title}
            error={errors.title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />

          <Textarea
            placeholder="メモ"
            value={memo}
            error={errors.memo}
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
              error={errors.start_time}
              onChange={(e) => setStartTime(e.currentTarget.value)}
            />
            <TextInput
              type="time"
              value={endTime}
              error={errors.end_time}
              onChange={(e) => setEndTime(e.currentTarget.value)}
            />
          </Group>

          <Button onClick={handleAdd}>追加</Button>
        </Stack>
      </Card>

      {/* 一覧 */}
      <Stack>
        {sortedEvents.map((e: Event) => (
          <Card
            key={e.id}
            shadow="xs"
            p="md"
            onClick={() => openModal(e)}
            style={{
              cursor: "pointer",
              borderLeft: `5px solid ${
                e.user_id === "hiro" ? "#228be6" : "#fa52bf"
              }`,
            }}
          >
            <Group justify="space-between">
              <Title order={5}>{e.title}</Title>

              <Badge color={e.user_id === "hiro" ? "blue" : "pink"}>
                {e.user_id === "hiro" ? "ひろくま" : "あきくま"}
              </Badge>
            </Group>

            <Box>{e.memo}</Box>

            <Box style={{ fontSize: 12, opacity: 0.7 }}>
              {e.start_time} - {e.end_time}
            </Box>
          </Card>
        ))}
      </Stack>

      {/* 編集モーダル */}
      <Modal opened={opened} onClose={() => closeModal()} title="予定編集">
        <Stack>
          <TextInput
            value={title}
            error={errors.title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />

          <Textarea
            value={memo}
            error={errors.memo}
            onChange={(e) => setMemo(e.currentTarget.value)}
          />

          <Select
            value={eventUser}
            onChange={(v) => v && setEventUser(v as "hiro" | "aki")}
            data={[
              { value: "hiro", label: "ひろくま" },
              { value: "aki", label: "あきくま" },
            ]}
          />

          <Group grow>
            <TextInput
              type="time"
              error={errors.start_time}
              value={startTime}
              onChange={(e) => setStartTime(e.currentTarget.value)}
            />
            <TextInput
              type="time"
              value={endTime}
              error={errors.end_time}
              onChange={(e) => setEndTime(e.currentTarget.value)}
            />
          </Group>

          <Group justify="space-between">
            <Button color="red" onClick={() => openDeleteModal(selectedEvent!)}>
              削除
            </Button>
            <Button onClick={handleUpdate}>保存</Button>
          </Group>
        </Stack>
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        opened={deleteOpened}
        onClose={() => setDeleteOpened(false)}
        title="削除確認"
      >
        <Stack>
          <Box>この予定を削除しますか？</Box>

          <Group justify="space-between">
            <Button variant="default" onClick={() => setDeleteOpened(false)}>
              キャンセル
            </Button>

            <Button color="red" onClick={handleDelete}>
              削除する
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
