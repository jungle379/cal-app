import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useEvents = (date: string) => {
  return useQuery({
    queryKey: ["events", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("date", date);

      if (error) throw error;
      return data;
    },
  });
};
