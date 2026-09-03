import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookX, Sparkles } from "lucide-react";
import { useGmAvailableScenarios } from "./useGmAvailableScenarios";
import "./ReportBookshelf.css";
import "./GmAvailable.css";
import Pagination, { ITEMS_PER_PAGE } from "../../components/Pagination";
import {
  genreOptions,
  genreSubtabClass,
  matchesGenreFilter,
  viewOptions,
  type GenreFilter,
  type ViewMode,
} from "./scenarioGenre";
import { BookCard, ReportListRow } from "./scenarioListDisplay";

type PlayerFilter = "2PL" | "3PL" | "4PL" | "5PL" | "6PL" | "7PL" | "8PL" | "9PL～";
const playerFilters: PlayerFilter[] = ["2PL", "3PL", "4PL", "5PL", "6PL", "7PL", "8PL", "9PL～"];

function matchesPlayerCount(value: string | null, filter: PlayerFilter) {
  if (!value) return false;
  const numbers = value.match(/\d+/g)?.map(Number) ?? [];
  if (filter === "9PL～") return numbers.some((n) => n >= 9);
  const target = Number(filter[0]);
  return numbers.includes(target);
}

function playerCountBadge(value: string | null): string {
  return value ? `${value}PL` : "-";
}

export default function GmAvailableList() {
  const { scenarios, loading, error } = useGmAvailableScenarios();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerFilter[]>(() =>
    playerFilters.filter((filter) => searchParams.getAll("pl").includes(filter))
  );
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
  const [currentPage, setCurrentPage] = useState(1);

  const displayScenarios = useMemo(() => {
    return scenarios
      .filter((scenario) => matchesGenreFilter(scenario.genre, activeGenre))
      .filter(
        (scenario) =>
          selectedPlayers.length === 0 ||
          selectedPlayers.some((filter) => matchesPlayerCount(scenario.playerCount, filter))
      )
      .map((scenario, index) => ({ ...scenario, number: index + 1 }));
  }, [scenarios, activeGenre, selectedPlayers]);

  const handleGenreChange = (genre: GenreFilter) => {
    setCurrentPage(1);
    setActiveGenre(genre);
    const nextParams = new URLSearchParams(searchParams);
    if (genre === "all") {
      nextParams.delete("genre");
    } else {
      nextParams.set("genre", genre);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleViewModeChange = (view: ViewMode) => {
    setViewMode(view);
    const nextParams = new URLSearchParams(searchParams);
    if (view === "bookshelf") {
      nextParams.delete("view");
    } else {
      nextParams.set("view", view);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handlePlayerFilterToggle = (filter: PlayerFilter) => {
    const next = selectedPlayers.includes(filter)
      ? selectedPlayers.filter((item) => item !== filter)
      : [...selectedPlayers, filter];
    setSelectedPlayers(next);
    setCurrentPage(1);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("pl");
    next.forEach((item) => nextParams.append("pl", item));
    setSearchParams(nextParams, { replace: true });
  };

  const totalPages = Math.ceil(displayScenarios.length / ITEMS_PER_PAGE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const visibleScenarios = displayScenarios.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Sparkles className="loading-icon" />
        <span>GM可能シナリオを並べています...</span>
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
    <div className="report-bookshelf gm-available">
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
                  className={`report-subtab-btn ${activeGenre === option.value ? "active" : ""} ${genreSubtabClass(option.value)}`}
                  onClick={() => handleGenreChange(option.value)}
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
                onClick={() => handleViewModeChange(option.value)}
              >
                <Icon size={14} className="report-view-icon" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="gm-filter-buttons" role="group" aria-label="PL数で絞り込み">
        {playerFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={selectedPlayers.includes(filter) ? "active" : ""}
            aria-pressed={selectedPlayers.includes(filter)}
            onClick={() => handlePlayerFilterToggle(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalItems={displayScenarios.length}
        onPageChange={setCurrentPage}
      />

      {displayScenarios.length === 0 ? (
        <div className="empty-schedule-box">
          <BookX className="empty-schedule-icon" />
          <span>該当するGM可能シナリオはありません</span>
        </div>
      ) : viewMode === "list" ? (
        <div className="report-list">
          {visibleScenarios.map((scenario) => (
            <ReportListRow
              key={scenario.scenarioId}
              number={scenario.number}
              badge={playerCountBadge(scenario.playerCount)}
              title={scenario.title}
              genre={scenario.genre}
              onClick={() => navigate(`/scenario/gm/${scenario.scenarioId}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bookshelf">
          {visibleScenarios.map((scenario) => (
            <BookCard
              key={scenario.scenarioId}
              number={scenario.number}
              badge={scenario.playerCount ? playerCountBadge(scenario.playerCount) : null}
              title={scenario.title}
              imageUrl={scenario.trailerUrl}
              genre={scenario.genre}
              onClick={() => navigate(`/scenario/gm/${scenario.scenarioId}`)}
            />
          ))}
        </div>
      )}
      <Pagination
        currentPage={page}
        totalItems={displayScenarios.length}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
