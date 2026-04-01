import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type BulkDeleteParams =
  | { mode: "range"; start: string; end: string }
  | { mode: "month"; month: string };

export const useBulkDeleteEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: BulkDeleteParams) => {
      let query = supabase.from("events").delete();

      if (params.mode === "range") {
        query = query.gte("date", params.start).lte("date", params.end);
      }

      if (params.mode === "month") {
        const start = `${params.month}-01`;
        const end = `${params.month}-31`;

        query = query.gte("date", start).lte("date", end);
      }

      const { error } = await query;
      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
