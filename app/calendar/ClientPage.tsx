"use client";

import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Modal,
  Badge,
  Button,
  ActionIcon,
  TextInput,
  Textarea,
  Select,
  Stack,
  Group,
  Card,
  Title,
  Box,
  Notification,
  SegmentedControl,
  Center,
  Loader,
} from "@mantine/core";
import z from "zod";
import { useEvents } from "@/hooks/useEvent";
import { useAddEvent } from "@/hooks/useAddEvent";
import { useDeleteEvent } from "@/hooks/useDeleteEvent";
import { useUpdateEvent } from "@/hooks/useUpdateEvent";
import { useBulkDeleteEvents } from "@/hooks/useBulkDeleteEvent";
import { TileProps,Event } from "../types/type";

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

    user_id: z.enum(["hiro", "aki", "akihiro"]),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "終了時間は開始時間より後にしてください",
    path: ["end_time"],
  });

// -----------------------------

// カレンダーページ
export default function ClientPage() {
  const [date, setDate] = useState<Date>(new Date());

  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [eventUser, setEventUser] = useState<"hiro" | "aki" | "akihiro">("aki");

  const [editDate, setEditDate] = useState("");

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const [opened, setOpened] = useState(false);
  const [deleteOpened, setDeleteOpened] = useState(false);
  const [bulkOpened, setBulkOpened] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [bulkMode, setBulkMode] = useState<"range" | "month">("range");
  const [bulkStart, setBulkStart] = useState("");
  const [bulkEnd, setBulkEnd] = useState("");
  const [bulkMonth, setBulkMonth] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const formattedDate = format(date, "yyyy-MM-dd");

  const { data: allEvents = [], isLoading, error, refetch } = useEvents();

  const events = allEvents.filter((e) => e.date === formattedDate);
  const addEvent = useAddEvent();
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();
  const bulkDelete = useBulkDeleteEvents();

  const formattedTime = (t: string) => t.slice(0, 5);

  if (toast !== null) {
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  // 🔴 日付マーク
  const eventDates = useMemo(
    () => new Set(allEvents.map((e: Event) => e.date)),
    [allEvents],
  );

  const tileContent = ({ date, view }: TileProps) => {
    if (view !== "month") return null;
    const d = format(date, "yyyy-MM-dd");
    if (eventDates.has(d)) {
      return <Box style={{ textAlign: "center" }}>●</Box>;
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

    if (!formattedDate) {
      setToast("日付が設定誤りです。");
      return;
    }
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
    setEventUser("aki");
    setToast("予定を追加しました。");
    window.scrollTo(0, 0);
  };

  // ✏️ モーダル開く
  const openModal = (e: Event) => {
    setSelectedEvent(e);
    setTitle(e.title);
    setMemo(e.memo);
    setStartTime(formattedTime(e.start_time));
    setEndTime(formattedTime(e.end_time));
    setEventUser(e.user_id);
    setEditDate(e.date);
    setOpened(true);
  };
  const closeModal = () => {
    setTitle("");
    setMemo("");
    setEventUser("aki");
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
      date: editDate,
      memo,
      user_id: eventUser,
      start_time: formattedTime(startTime),
      end_time: formattedTime(endTime),
    });

    setOpened(false);
    setTitle("");
    setMemo("");
    setEventUser("aki");
    setStartTime("09:00");
    setEndTime("10:00");
    setToast("予定を更新しました。");
    window.scrollTo(0, 0);
  };

  // 🗑 削除
  const handleDelete = async () => {
    if (!selectedEvent) return;

    deleteEvent.mutate(selectedEvent.id);
    setDeleteOpened(false);
    setOpened(false);
    setTitle("");
    setMemo("");
    setEventUser("aki");
    setStartTime("09:00");
    setEndTime("10:00");
    setToast("予定を削除しました。");
    window.scrollTo(0, 0);
  };

  // ⏰ ソート
  const sortedEvents = [...events].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  // -----------------------------
  // 一括削除
  // -----------------------------
  const handleBulkDelete = async () => {
    try {
      if (bulkMode === "range") {
        if (!bulkStart || !bulkEnd) {
          setToast("期間を選択してください");
          return;
        }
        if (bulkStart > bulkEnd) {
          setToast("開始日は終了日より前にしてください");
          return;
        }

        await bulkDelete.mutateAsync({
          mode: "range",
          start: bulkStart,
          end: bulkEnd,
        });
      }

      if (bulkMode === "month") {
        if (!bulkMonth) {
          setToast("月を選択してください");
          return;
        }

        await bulkDelete.mutateAsync({
          mode: "month",
          month: bulkMonth,
        });
      }

      setBulkOpened(false);
      setToast("削除しました");
      window.scrollTo(0, 0);
    } catch {
      setToast("削除失敗");
      window.scrollTo(0, 0);
    }
  };

  // 件数
  const bulkCount = useMemo(() => {
    if (bulkMode === "range") {
      return allEvents.filter((e) => e.date >= bulkStart && e.date <= bulkEnd)
        .length;
    }

    if (bulkMode === "month") {
      return allEvents.filter((e) => e.date.startsWith(bulkMonth)).length;
    }
    return 0;
  }, [allEvents, bulkStart, bulkEnd, bulkMonth, bulkMode]);

  // -----------------------------

  if (isLoading) {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center style={{ minHeight: "100vh" }}>
        <Box>イベントの読み込みに失敗しました。</Box>
      </Center>
    );
  }

  return (
    <Stack p="md" maw={560} mx="auto">
      <Group align="end">
        <Title order={2}>共有カレンダー</Title>
          <ActionIcon
            variant="light"
            onClick={() => refetch()}
            aria-label="リロード"
            style={{ marginLeft: 20 }}
            size="lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
            </svg>
          </ActionIcon>
      </Group>

      {toast && (
        <Notification color="teal" onClose={() => setToast(null)}>
          {toast}
        </Notification>
      )}

      {/* カレンダー */}
      <Center>
        <Calendar
          className="app-react-calendar"
          value={date}
          onChange={(d) => setDate(d as Date)}
          tileContent={tileContent}
        />
      </Center>

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
            placeholder="メモ(詳細や場所など)"
            value={memo}
            error={errors.memo}
            onChange={(e) => setMemo(e.currentTarget.value)}
          />

          <Select
            label="ユーザー"
            value={eventUser}
            onChange={(v) => v && setEventUser(v as "hiro" | "aki" | "akihiro")}
            data={[
              { value: "aki", label: "あきくま（ピンク）" },
              { value: "hiro", label: "ひろくま（青）" },
              { value: "akihiro", label: "あきくま・ひろくま（オレンジ）" },
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
      {sortedEvents.length > 0 && (
        <Stack>
          <Box fw={700}>{format(date, "yyyy年M月d日(E)", { locale: ja })}</Box>
          {sortedEvents.map((e: Event) => (
            <Card
              key={e.id}
              shadow="xs"
              p="md"
              onClick={() => openModal(e)}
              style={{
                cursor: "pointer",
                borderLeft: `5px solid ${
                  e.user_id === "hiro"
                    ? "#228be6"
                    : e.user_id === "aki"
                      ? "#fa52bf"
                      : "#fab005"
                }`,
              }}
            >
              <Group justify="space-between">
                <Title order={5}>{e.title}</Title>

                <Badge
                  color={
                    e.user_id === "hiro"
                      ? "blue"
                      : e.user_id === "aki"
                        ? "pink"
                        : "yellow"
                  }
                >
                  {e.user_id === "hiro"
                    ? "ひろくま"
                    : e.user_id === "aki"
                      ? "あきくま"
                      : "あきくま・ひろくま"}
                </Badge>
              </Group>

              <Box
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {e.memo}
              </Box>

              <Box style={{ fontSize: 12, opacity: 0.7 }}>
                {e.start_time} - {e.end_time}
              </Box>
            </Card>
          ))}
        </Stack>
      )}

      {/* 一括削除ボタン */}
      <Button color="red" onClick={() => setBulkOpened(true)}>
        一括削除
      </Button>

      {/* 編集モーダル */}
      <Modal opened={opened} onClose={() => closeModal()} title="予定編集">
        <Stack>
          <TextInput
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.currentTarget.value)}
          />
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
            onChange={(v) => v && setEventUser(v as "hiro" | "aki" | "akihiro")}
            data={[
              { value: "aki", label: "あきくま" },
              { value: "hiro", label: "ひろくま" },
              { value: "akihiro", label: "あきくま・ひろくま" },
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

      {/* 一括削除モーダル */}
      <Modal
        opened={bulkOpened}
        onClose={() => setBulkOpened(false)}
        title="一括削除"
      >
        <Stack>
          <SegmentedControl
            value={bulkMode}
            onChange={(v) => setBulkMode(v as "range" | "month")}
            data={[
              { label: "期間指定", value: "range" },
              { label: "月単位", value: "month" },
            ]}
          />

          {bulkMode === "range" && (
            <>
              <TextInput
                type="date"
                label="開始"
                value={bulkStart}
                onChange={(e) => setBulkStart(e.currentTarget.value)}
              />
              <TextInput
                type="date"
                label="終了"
                value={bulkEnd}
                onChange={(e) => setBulkEnd(e.currentTarget.value)}
              />
            </>
          )}

          {bulkMode === "month" && (
            <TextInput
              type="month"
              label="対象月"
              value={bulkMonth}
              onChange={(e) => setBulkMonth(e.currentTarget.value)}
            />
          )}

          <Box>削除対象: {bulkCount}件</Box>

          <Button color="red" onClick={handleBulkDelete}>
            削除する
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
