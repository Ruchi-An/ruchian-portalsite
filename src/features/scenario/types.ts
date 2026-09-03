// -------------------------------------------------------------
// シナリオ通過報告・通過予定・GM可能ページ用の型定義
// -------------------------------------------------------------

// 一覧（本棚）表示用の1冊分のデータ
export type ScenarioReportListItem = {
  scheduleId: string;
  date: string;
  title: string;
  endcardUrl: string | null;
  genre: string | null;
};

// 詳細ページ用の役キャスト情報
export type ReportCast = {
  participantId: string;
  profileId: string | null;
  profileName: string;
  profileIconUrl: string | null;
  role: string | null; // schedule_participants.role （例: PL / GM）
  characterName: string | null; // scenario_characters.character_name
  characterType: string | null; // scenario_characters.type （PC / HO 等）
  characterNumber: number | null;
};

// 詳細ページ用のシナリオ情報
export type ScenarioDetailInfo = {
  title: string;
  genre: string | null;
  playerCount?: string | null;
  production: string | null;
  productionUrl: string | null;
  creator: string | null;
  creatorUrl: string | null;
  credit: string | null;
  synopsis: string | null;
  summary: string | null;
  officialUrl: string | null;
  trailerUrl: string | null;
  scenarioTag: string | null;
  characterDisclosure: string | null;
};

// 詳細ページ全体で使うデータ
export type ScenarioReportDetail = {
  scheduleId: string;
  date: string;
  time: string | null;
  memo: string | null;
  endcardUrl: string | null;
  thumbnailUrl: string | null;
  stream: boolean;
  streamUrl: string | null;
  scenario: ScenarioDetailInfo | null;
  cast: ReportCast[];
};

export type GmScenarioListItem = {
  scenarioId: string;
  title: string;
  genre: string | null;
  playerCount: string | null;
  scenarioTag: string | null;
  trailerUrl: string | null;
};

export type GmTableHistory = {
  scheduleId: string;
  date: string;
  members: string[];
  streamUrl: string | null;
};

export type GmScenarioDetail = {
  scenarioId: string;
  scenario: ScenarioDetailInfo;
  history: GmTableHistory[];
};
