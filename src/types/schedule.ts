export type Schedule = {
  id: string;
  obsidian_id: string;
  obsidian_path: string | null;

  type: string | null;
  category: string | null;
  label: string | null;

  title: string;

  game_id: string | null;
  scenario_id: string | null;

  // Supabaseのリレーション（存在しない場合は null が返る）
  games?: {
    genre: string | null;
    official_url: string | null;
  } | null;

  scenarios?: {
    id: string;
    genre: string | null;
    official_url: string | null;
  } | null;

  date: string | null;
  time: string | null;

  // 時間帯フラグ
  is_all_day: boolean;      // 終日
  is_morning: boolean;      // 朝 (6:00-12:00)
  is_afternoon: boolean;    // 昼 (12:00-18:00)
  is_night: boolean;        // 夜 (18:00-24:00)
  is_late_night: boolean;   // 深夜 (24:00-30:00)

  stream: boolean;
  stream_url: string | null;

  server: string | null;
  server_url: string | null;

  role: string | null;

  thumbnail_url: string | null;

  endcard_url: string | null;

  memo: string | null;

  created_at: string;
  updated_at: string;
};