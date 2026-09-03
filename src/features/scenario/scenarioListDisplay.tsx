import { Feather } from "lucide-react";
import { resolveGenreTheme, type GenreTheme } from "./scenarioGenre";

// =============================================================
// 通過報告（ReportBookshelf）と GM可能（GmAvailableList）で
// 共通利用する本棚カード / リスト行の描画。
// 通過報告側の表示方法を正として、両者で同じ見た目にする。
// =============================================================

function listRowThemeClass(theme: GenreTheme): string {
  return theme === "murder" ? "list-murder" : theme === "story" ? "list-story" : "list-other";
}

// 本棚カード（連番バッジ + 右上バッジ + 表紙 + タイトル帯）
export function BookCard({
  number,
  badge,
  title,
  imageUrl,
  genre,
  onClick,
}: {
  number: number;
  badge?: string | null;
  title: string;
  imageUrl: string | null;
  genre?: string | null;
  onClick: () => void;
}) {
  const genreTheme = resolveGenreTheme(genre);

  return (
    <button type="button" className="book-card" onClick={onClick}>
      <span className="book-top-bar">
        <span className="book-number-badge font-pop">#{number}</span>
      </span>

      <span className="book-cover" data-genre={genreTheme}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="book-cover-img" loading="lazy" />
        ) : (
          <span className="book-cover-fallback">
            <Feather size={22} />
          </span>
        )}

        {badge && <span className="book-date-chip font-yomogi">{badge}</span>}

        <span className="book-cover-tint" aria-hidden="true" />
        <span className="book-cover-shine" aria-hidden="true" />

        <span className="book-title-scrim">
          <span className="book-title-text font-pop">{title}</span>
        </span>
      </span>
    </button>
  );
}

// リスト行（連番 / バッジ / タイトルの3カラム）
export function ReportListRow({
  number,
  badge,
  title,
  genre,
  onClick,
}: {
  number: number;
  badge?: string | null;
  title: string;
  genre?: string | null;
  onClick: () => void;
}) {
  const theme = resolveGenreTheme(genre);

  return (
    <button
      type="button"
      className={`report-list-row ${listRowThemeClass(theme)}`}
      onClick={onClick}
    >
      <span className="report-list-number font-yomogi">#{number}</span>
      <span className="report-list-date font-yomogi">{badge}</span>
      <span className="report-list-title font-pop">{title}</span>
    </button>
  );
}
