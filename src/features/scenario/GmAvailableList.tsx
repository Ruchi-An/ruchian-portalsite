import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Book, BookX, Feather, LibraryBig, PanelTop, Rows3, Sparkles } from "lucide-react";
import { useGmAvailableScenarios } from "./useGmAvailableScenarios";
import "./ReportBookshelf.css";
import "./GmAvailable.css";
import Pagination, { ITEMS_PER_PAGE } from "../../components/Pagination";

type PlayerFilter = "2PL" | "3PL" | "4PL" | "5PL" | "6PL" | "7PL" | "8PL" | "9PL～";
type GenreFilter = "all" | "murder" | "story" | "other";
const playerFilters: PlayerFilter[] = ["2PL", "3PL", "4PL", "5PL", "6PL", "7PL", "8PL", "9PL～"];
const genreFilters: { value: GenreFilter; label: string; icon: typeof Book }[] = [
  { value: "all", label: "すべて", icon: LibraryBig },
  { value: "murder", label: "マダミス", icon: Book },
  { value: "story", label: "ストプレ", icon: Book },
  { value: "other", label: "その他", icon: Book },
];

function matchesPlayerCount(value: string | null, filter: PlayerFilter) {
  if (!value) return false;
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  if (filter === "9PL～") return numbers.some((n) => n >= 9);
  const target = Number(filter[0]);
  return numbers.includes(target);
}
function genreTheme(value: string | null) {
  if (value?.includes("マーダー") || value?.includes("マダミス")) return "murder";
  if (value?.includes("ストーリー") || value?.includes("ストプレ") || value?.includes("TRPG")) return "story";
  return "other";
}

export default function GmAvailableList() {
  const { scenarios, loading, error } = useGmAvailableScenarios();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<PlayerFilter[]>(() => playerFilters.filter((filter) => params.getAll("pl").includes(filter)));
  const [genre, setGenre] = useState<GenreFilter>((params.get("genre") as GenreFilter) ?? "all");
  const [viewMode, setViewMode] = useState<"bookshelf" | "list">(params.get("view") === "list" ? "list" : "bookshelf");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => scenarios.filter((scenario) => (genre === "all" || genreTheme(scenario.genre) === genre) && (selected.length === 0 || selected.some((filter) => matchesPlayerCount(scenario.playerCount, filter)))), [scenarios, genre, selected]);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const visible = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const updateFilters = (filter: PlayerFilter) => {
    const next = selected.includes(filter) ? selected.filter((item) => item !== filter) : [...selected, filter];
    setSelected(next);
    setPage(1);
    const nextParams = new URLSearchParams(params);
    nextParams.delete("pl");
    next.forEach((item) => nextParams.append("pl", item));
    setParams(nextParams, { replace: true });
  };

  if (loading) return <div className="loading-container"><Sparkles className="loading-icon" /><span>GM可能シナリオを並べています...</span></div>;
  if (error) return <div className="empty-schedule-box"><BookX className="empty-schedule-icon" /><span>データの取得に失敗しました。</span></div>;

  return <div className="report-bookshelf gm-available">
    <div className="report-subtabs-container" role="tablist" aria-label="ジャンルで絞り込み"><div className="report-subtabs">{genreFilters.map((option) => { const Icon = option.icon; return <button key={option.value} type="button" role="tab" aria-selected={genre === option.value} className={`report-subtab-btn ${genre === option.value ? "active" : ""} genre-${option.value}`} onClick={() => { setGenre(option.value); setPage(1); }}><Icon size={16} className="report-subtab-icon" /><span>{option.label}</span></button>; })}</div></div>
    <div className="gm-filter-buttons" role="group" aria-label="PL数で絞り込み">
      {playerFilters.map((filter) => <button key={filter} type="button" className={selected.includes(filter) ? "active" : ""} aria-pressed={selected.includes(filter)} onClick={() => updateFilters(filter)}>{filter}</button>)}
    </div>
    <div className="report-view-switcher">
      <button type="button" className={`report-view-btn ${viewMode === "bookshelf" ? "active" : ""}`} onClick={() => setViewMode("bookshelf")}><PanelTop size={14} />本棚</button>
      <button type="button" className={`report-view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}><Rows3 size={14} />リスト</button>
    </div>
    <Pagination currentPage={currentPage} totalItems={filtered.length} onPageChange={setPage} />
    {visible.length === 0 ? <div className="empty-schedule-box"><BookX className="empty-schedule-icon" /><span>該当するGM可能シナリオはありません</span></div> : viewMode === "list" ? <div className="report-list">{visible.map((scenario) => { const theme = genreTheme(scenario.genre); return <button key={scenario.scenarioId} type="button" className={`report-list-row list-${theme}`} onClick={() => navigate(`/scenario/gm/${scenario.scenarioId}`)}><span className="report-list-date font-yomogi">{scenario.playerCount ? `${scenario.playerCount}PL` : "-"}</span><span className="report-list-title font-pop">{scenario.title}</span></button>; })}</div> : <div className="bookshelf">{visible.map((scenario) => { const theme = genreTheme(scenario.genre); return <button key={scenario.scenarioId} type="button" className="book-card" onClick={() => navigate(`/scenario/gm/${scenario.scenarioId}`)}><span className="book-cover" data-genre={theme}>{scenario.trailerUrl ? <img src={scenario.trailerUrl} alt="" className="book-cover-img" loading="lazy" /> : <span className="book-cover-fallback"><Feather size={22} /></span>}<span className="book-cover-tint" /><span className="book-title-scrim"><span className="book-title-text font-pop">{scenario.title}</span></span></span></button>; })}</div>}
    <Pagination currentPage={currentPage} totalItems={filtered.length} onPageChange={setPage} />
  </div>;
}
