import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { GmScenarioListItem } from "./types";

type RawScenario = {
  id: string;
  title: string | null;
  genre: string | null;
  scenario_tag: string | null;
  trailer_url: string | null;
  scenario_characters: {
    character_number: number | null;
  }[] | null;
};

function getPlayerCount(characters: RawScenario["scenario_characters"]) {
  const numbers = (characters ?? [])
    .map((character) => character.character_number)
    .filter((number): number is number => number != null);
  return numbers.length > 0 ? String(Math.max(...numbers)) : null;
}

export function useGmAvailableScenarios() {
  const [scenarios, setScenarios] = useState<GmScenarioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from("scenarios")
        .select("id, title, genre, scenario_tag, trailer_url, scenario_characters(character_number)")
        .eq("gm_permission", true)
        .order("title", { ascending: true })
        .returns<RawScenario[]>();
      if (supabaseError) throw supabaseError;
      setScenarios((data ?? []).filter((row) => row.title?.trim()).map((row) => ({
        scenarioId: row.id,
        title: row.title!.trim(),
        genre: row.genre,
        playerCount: getPlayerCount(row.scenario_characters),
        scenarioTag: row.scenario_tag,
        trailerUrl: row.trailer_url,
      })));
    } catch (err) {
      console.error("Failed to fetch GM-available scenarios:", err);
      setError(err instanceof Error ? err : new Error("GM可能シナリオの取得に失敗しました"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch on mount; the hook exposes loading/error state for the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchScenarios();
  }, [fetchScenarios]);

  return { scenarios, loading, error, refetch: fetchScenarios };
}
