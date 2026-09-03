import { Book, LibraryBig, PanelTop, Rows3, type LucideIcon } from "lucide-react";

// =============================================================
// 通過報告（ReportBookshelf）と GM可能（GmAvailableList）で
// 共通利用するジャンル判定・フィルタ選択肢の定義。
// 一覧の「表示方法」を統一するため、ここに集約する。
// =============================================================

export type GenreTheme = "murder" | "story" | "other";
export type GenreFilter = "all" | GenreTheme;
export type ViewMode = "bookshelf" | "list";

export const genreOptions: { value: GenreFilter; label: string; icon: LucideIcon }[] = [
  { value: "all", label: "すべて", icon: LibraryBig },
  { value: "murder", label: "マダミス", icon: Book },
  { value: "story", label: "ストプレ", icon: Book },
  { value: "other", label: "その他", icon: Book },
];

export const viewOptions: { value: ViewMode; label: string; icon: LucideIcon }[] = [
  { value: "bookshelf", label: "本棚", icon: PanelTop },
  { value: "list", label: "リスト", icon: Rows3 },
];

// ジャンル文字列からテーマを判定する
export function resolveGenreTheme(genreLabel?: string | null): GenreTheme {
  if (!genreLabel) return "other";
  if (genreLabel.includes("マーダー") || genreLabel.includes("マダミス")) return "murder";
  if (genreLabel.includes("ストーリー") || genreLabel.includes("ストプレ") || genreLabel.includes("TRPG")) return "story";
  return "other";
}

export function matchesGenreFilter(genreLabel: string | null | undefined, filter: GenreFilter): boolean {
  if (filter === "all") return true;
  return resolveGenreTheme(genreLabel) === filter;
}

export function genreSubtabClass(value: GenreFilter): string {
  if (value === "all") return "genre-all";
  if (value === "murder") return "genre-murder";
  if (value === "story") return "genre-story";
  return "genre-other";
}
