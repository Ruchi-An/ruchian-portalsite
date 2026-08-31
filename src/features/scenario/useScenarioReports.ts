import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { ScenarioReportListItem } from "./types";

// Supabaseから返る生データの型（このhook内だけで使う）
type RawRow = {
  id: string;
  date: string;
  title: string;
  endcard_url: string | null;
  scenarios: {
    title: string | null;
    genre: string | null;
  } | null;
};

export type ScenarioReportListEntry = ScenarioReportListItem & {
  // 日付が古い順に振った連番（表示は降順でも、番号は古い順=1から）
  number: number;
};

export function useScenarioReports() {
  const [reports, setReports] = useState<ScenarioReportListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const todayString = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-");

      // 種類=予定 / 分類=シナリオ / 担当=PL のスケジュールを
      // 今日を含まない「今日より前の日付」のみ取得し、日付の古い順に並べる
      const { data, error: supabaseError } = await supabase
        .from("schedules")
        .select(
          `
          id,
          date,
          title,
          endcard_url,
          scenarios (
            title,
            genre
          )
        `
        )
        .eq("type", "予定")
        .eq("category", "シナリオ")
        .eq("role", "PL")
        .lt("date", todayString)
        .order("date", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<RawRow[]>();

      if (supabaseError) {
        throw supabaseError;
      }

      const rows = data ?? [];

      // 同じタイトルの複数レコードがある場合は、日付が新しいものだけ残す
      const latestByTitle = new Map<string, RawRow>();
      for (const row of rows) {
        const title = (row.scenarios?.title ?? row.title ?? "").trim();
        if (!title) {
          continue;
        }

        const existing = latestByTitle.get(title);
        if (!existing || (row.date ?? "") > (existing.date ?? "")) {
          latestByTitle.set(title, row);
        }
      }

      const uniqueRows = Array.from(latestByTitle.values()).sort((a, b) =>
        (a.date ?? "").localeCompare(b.date ?? "")
      );

      // 古い順に連番を振ってから、表示用に新しい順へ反転する
      const numbered: ScenarioReportListEntry[] = uniqueRows.map((row, index) => ({
        scheduleId: row.id,
        date: row.date,
        title: row.scenarios?.title ?? row.title,
        endcardUrl: row.endcard_url,
        genre: row.scenarios?.genre ?? null,
        number: index + 1,
      }));

      setReports(numbered.reverse());
    } catch (err) {
      console.error("Failed to fetch scenario reports:", err);
      setError(
        err instanceof Error ? err : new Error("通過報告データの取得に失敗しました")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, loading, error, refetch: fetchReports };
}
