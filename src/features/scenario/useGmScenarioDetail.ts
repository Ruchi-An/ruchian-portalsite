import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { GmScenarioDetail } from "./types";

type RawScenario = {
  title: string | null;
  genre: string | null;
  scenario_characters: {
    character_number: number | null;
  }[] | null;
  production: string | null;
  production_url: string | null;
  creator: string | null;
  creator_url: string | null;
  credit: string | null;
  synopsis: string | null;
  summary: string | null;
  official_url: string | null;
  trailer_url: string | null;
  scenario_tag: string | null;
  character_disclosure: string | null;
};

function getPlayerCount(characters: RawScenario["scenario_characters"]) {
  const numbers = (characters ?? [])
    .map((character) => character.character_number)
    .filter((number): number is number => number != null);
  return numbers.length > 0 ? String(Math.max(...numbers)) : null;
}

type RawSchedule = {
  id: string;
  date: string | null;
  stream: boolean;
  stream_url: string | null;
  schedule_participants: {
    role: string | null;
    profiles: { name: string | null } | null;
  }[];
};

export function useGmScenarioDetail(scenarioId: string | undefined) {
  const [detail, setDetail] = useState<GmScenarioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchDetail = useCallback(async () => {
    if (!scenarioId) return;
    setLoading(true);
    setError(null);
    try {
      const [{ data: scenario, error: scenarioError }, { data: schedules, error: schedulesError }] =
        await Promise.all([
          supabase.from("scenarios").select("title, genre, production, production_url, creator, creator_url, credit, synopsis, summary, official_url, trailer_url, scenario_tag, character_disclosure, scenario_characters(character_number)").eq("id", scenarioId).eq("gm_permission", true).single().returns<RawScenario>(),
          supabase.from("schedules").select("id, date, stream, stream_url, schedule_participants(role, profiles(name))").eq("scenario_id", scenarioId).eq("type", "予定").eq("category", "シナリオ").eq("role", "GM").lt("date", new Date().toISOString().slice(0, 10)).order("date", { ascending: false }).returns<RawSchedule[]>(),
        ]);
      if (scenarioError) throw scenarioError;
      if (schedulesError) throw schedulesError;
      if (!scenario) throw new Error("シナリオが見つかりません");
      setDetail({
        scenarioId,
        scenario: {
          title: scenario.title ?? "",
          genre: scenario.genre,
          playerCount: getPlayerCount(scenario.scenario_characters),
          production: scenario.production,
          productionUrl: scenario.production_url,
          creator: scenario.creator,
          creatorUrl: scenario.creator_url,
          credit: scenario.credit,
          synopsis: scenario.synopsis,
          summary: scenario.summary,
          officialUrl: scenario.official_url,
          trailerUrl: scenario.trailer_url,
          scenarioTag: scenario.scenario_tag,
          characterDisclosure: scenario.character_disclosure,
        },
        history: (schedules ?? []).map((schedule) => ({
          scheduleId: schedule.id,
          date: schedule.date ?? "-",
          members: (schedule.schedule_participants ?? [])
            .filter((participant) => {
              const role = (participant.role ?? "").toUpperCase();
              return role !== "GM" && role !== "ST";
            })
            .map((participant) => participant.profiles?.name ?? "-"),
          streamUrl: schedule.stream && schedule.stream_url ? schedule.stream_url : null,
        })),
      });
    } catch (err) {
      console.error("Failed to fetch GM scenario detail:", err);
      setError(err instanceof Error ? err : new Error("GM可能シナリオの詳細取得に失敗しました"));
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);
  useEffect(() => {
    // Fetch when the selected scenario changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetail();
  }, [fetchDetail]);
  return { detail, loading, error };
}
