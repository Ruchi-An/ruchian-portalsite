import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sparkles,
  BookX,
  Feather,
  LibraryBig,
  Book,
  Rows3,
  PanelTop,
  type LucideIcon,
} from "lucide-react";
import { useScenarioReports } from "./useScenarioReports";
import "./ReportBookshelf.css";

type GenreTheme = "murder" | "story" | "other";
type GenreFilter = "all" | GenreTheme;
type ViewMode = "bookshelf" | "list";

const genreOptions: { value: GenreFilter; label: string; icon: LucideIcon }[] = [
  { value: "all", label: "すべて", icon: LibraryBig },
  { value: "murder", label: "マダミス", icon: Book },
  { value: "story", label: "ストプレ", icon: Book },
  { value: "other", label: "その他", icon: Book },
];

const viewOptions: { value: ViewMode; label: string; icon: LucideIcon }[] = [
  { value: "bookshelf", label: "本棚", icon: PanelTop },
  { value: "list", label: "リスト", icon: Rows3 },
];

// report側のジャンル文字列からテーマを判定する
function resolveGenreTheme(genreLabel?: string | null): GenreTheme {
  if (!genreLabel) return "other";
  if (genreLabel.includes("マーダー") || genreLabel.includes("マダミス")) return "murder";
  if (genreLabel.includes("ストーリー") || genreLabel.includes("ストプレ") || genreLabel.includes("TRPG")) return "story";
  return "other";
}

function matchesGenreFilter(genreLabel: string | null | undefined, filter: GenreFilter): boolean {
  if (filter === "all") return true;
  return resolveGenreTheme(genreLabel) === filter;
}

function BookCard({
  number,
  date,
  title,
  endcardUrl,
  genre,
  onClick,
}: {
  number: number;
  date: string | null;
  title: string;
  endcardUrl: string | null;
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
      {endcardUrl ? (
        <img src={endcardUrl} alt="" className="book-cover-img" loading="lazy" />
      ) : (
        <span className="book-cover-fallback">
          <Feather size={22} />
        </span>
      )}

      {date && <span className="book-date-chip font-yomogi">{date}</span>}

      <span className="book-cover-tint" aria-hidden="true" />
      <span className="book-cover-shine" aria-hidden="true" />

      <span className="book-title-scrim">
        <span className="book-title-text font-pop">{title}</span>
      </span>
    </span>
  </button>
  );
}

export default function ReportBookshelf() {
  const { reports, loading, error } = useScenarioReports();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeGenre, setActiveGenre] = useState<GenreFilter>(() => {
    const genreParam = searchParams.get("genre");
    if (genreParam === "murder" || genreParam === "story" || genreParam === "other") {
      return genreParam;
    }
    return "all";
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    searchParams.get("view") === "list" ? "list" : "bookshelf"
  );

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    let shouldUpdate = false;

    if (activeGenre === "all") {
      if (nextParams.has("genre")) {
        nextParams.delete("genre");
        shouldUpdate = true;
      }
    } else if (nextParams.get("genre") !== activeGenre) {
      nextParams.set("genre", activeGenre);
      shouldUpdate = true;
    }

    if (viewMode === "bookshelf") {
      if (nextParams.has("view")) {
        nextParams.delete("view");
        shouldUpdate = true;
      }
    } else if (nextParams.get("view") !== "list") {
      nextParams.set("view", "list");
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [activeGenre, viewMode, searchParams, setSearchParams]);

  const displayReports = useMemo(() => {
    return reports
      .filter((report) => matchesGenreFilter(report.genre, activeGenre))
      .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
      .map((report, index) => ({ ...report, number: index + 1 }));
  }, [reports, activeGenre]);

  if (loading) {
    return (
      <div className="loading-container">
        <Sparkles className="loading-icon" />
        <span>本棚を並べています...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-schedule-box">
        <BookX className="empty-schedule-icon" />
        <span>データの取得に失敗しました。時間を置いて再度お試しください。</span>
      </div>
    );
  }

  return (
    <div className="report-bookshelf">
      <div className="report-controls">
        <div className="report-subtabs-container" role="tablist" aria-label="ジャンルで絞り込み">
          <div className="report-subtabs">
            {genreOptions.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={activeGenre === option.value}
                  className={`report-subtab-btn ${activeGenre === option.value ? "active" : ""} ${option.value === "all" ? "genre-all" : option.value === "murder" ? "genre-murder" : option.value === "story" ? "genre-story" : "genre-other"}`}
                  onClick={() => setActiveGenre(option.value)}
                >
                  <Icon size={16} className="report-subtab-icon" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="report-view-switcher" role="tablist" aria-label="表示形式">
          {viewOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={viewMode === option.value}
                className={`report-view-btn ${viewMode === option.value ? "active" : ""}`}
                onClick={() => setViewMode(option.value)}
              >
                <Icon size={14} className="report-view-icon" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {displayReports.length === 0 ? (
        <div className="empty-schedule-box">
          <BookX className="empty-schedule-icon" />
          <span>該当する通過報告はありません</span>
        </div>
      ) : viewMode === "list" ? (
        <div className="report-list">
          {displayReports.map((report) => {
            const rowTheme = resolveGenreTheme(report.genre);

            return (
              <button
                key={report.scheduleId}
                type="button"
                className={`report-list-row ${rowTheme === "murder" ? "list-murder" : rowTheme === "story" ? "list-story" : "list-other"}`}
                onClick={() => navigate(`/scenario/report/${report.scheduleId}`, { state: { returnTo: `${window.location.pathname}${window.location.search}` } })}
              >
                <span className="report-list-number font-yomogi">#{report.number}</span>
                <span className="report-list-date font-yomogi">{report.date}</span>
                <span className="report-list-title font-pop">{report.title}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bookshelf">
          {displayReports.map((report) => (
            <BookCard
              key={report.scheduleId}
              number={report.number}
              date={report.date}
              title={report.title}
              endcardUrl={report.endcardUrl}
              genre={report.genre}
              onClick={() => navigate(`/scenario/report/${report.scheduleId}`, { state: { returnTo: `${window.location.pathname}${window.location.search}` } })}
            />
          ))}
        </div>
      )}
    </div>
  );
}