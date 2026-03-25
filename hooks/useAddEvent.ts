import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

type EventInput = {
  title: string;
  memo: string;
  date: string;
  user_id: string;
};

export const useAddEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, EventInput>({
    mutationFn: async (event) => {
      const { error } = await supabase.from("events").insert(event);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
