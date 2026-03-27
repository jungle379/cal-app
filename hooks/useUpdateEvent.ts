import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type EventInput = {
  id: string;
  title: string;
  memo: string;
  start_time: string;
  end_time: string;
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, memo }: EventInput) => {
      const { error } = await supabase
        .from("events")
        .update({ title, memo })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
