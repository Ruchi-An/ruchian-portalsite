import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, BookX } from "lucide-react";
import { useScenarioReports } from "./useScenarioReports";
import "./ReportBookshelf.css";
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
  const [currentPage, setCurrentPage] = useState(1);

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

  const handleGenreChange = (genre: GenreFilter) => {
    setCurrentPage(1);
    setActiveGenre(genre);
  };

  const totalPages = Math.ceil(displayReports.length / ITEMS_PER_PAGE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const visibleReports = displayReports.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

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
                onClick={() => setViewMode(option.value)}
              >
                <Icon size={14} className="report-view-icon" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalItems={displayReports.length}
        onPageChange={setCurrentPage}
      />

      {displayReports.length === 0 ? (
        <div className="empty-schedule-box">
          <BookX className="empty-schedule-icon" />
          <span>該当する通過報告はありません</span>
        </div>
      ) : viewMode === "list" ? (
        <div className="report-list">
          {visibleReports.map((report) => (
            <ReportListRow
              key={report.scheduleId}
              number={report.number}
              badge={report.date}
              title={report.title}
              genre={report.genre}
              onClick={() => navigate(`/scenario/report/${report.scheduleId}`, { state: { returnTo: `${window.location.pathname}${window.location.search}` } })}
            />
          ))}
        </div>
      ) : (
        <div className="bookshelf">
          {visibleReports.map((report) => (
            <BookCard
              key={report.scheduleId}
              number={report.number}
              badge={report.date}
              title={report.title}
              imageUrl={report.endcardUrl}
              genre={report.genre}
              onClick={() => navigate(`/scenario/report/${report.scheduleId}`, { state: { returnTo: `${window.location.pathname}${window.location.search}` } })}
            />
          ))}
        </div>
      )}
      <Pagination
        currentPage={page}
        totalItems={displayReports.length}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
