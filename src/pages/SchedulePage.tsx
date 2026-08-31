import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSchedules } from "../hooks/useSchedules";
import ScheduleCalendar from "../components/calendar/ScheduleCalendar";
import ScheduleCard from "../components/schedule/ScheduleCard";
import { ScheduleTabs } from "../components/tab/ScheduleTabs";
import { CalendarX, Sparkles } from "lucide-react";
import type { Schedule } from "../types/schedule";
import "../App.css";

// -------------------------------------------------------------
// 【サブコンポーネント】カード用ネオンラッパー
// -------------------------------------------------------------
function NeonCard({ schedule }: { schedule: Schedule }) {
  return (
    <div className="neon-wrapper-card">
      <div className="neon-inner-card">
        <ScheduleCard schedule={schedule} />
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 【サブコンポーネント】スケジュールリスト（共通表示）
// -------------------------------------------------------------
function ScheduleList({
  schedules,
  emptyMessage,
}: {
  schedules: Schedule[];
  emptyMessage: React.ReactNode;
}) {
  if (schedules.length === 0) {
    return <div className="empty-schedule-box">{emptyMessage}</div>;
  }

  return (
    <div className="schedule-list">
      {schedules.map((schedule, index) => (
        <NeonCard
          key={schedule.id ?? `${schedule.date}-${index}`}
          schedule={schedule}
        />
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// メインコンポーネント（旧 App.tsx の中身）
// -------------------------------------------------------------
export default function SchedulePage() {
  const { schedules = [], loading } = useSchedules();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"past" | "calendar" | "future">(() => {
    const tabParam = searchParams.get("tab");
    return tabParam === "past" || tabParam === "future" ? tabParam : "calendar";
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(() => searchParams.get("date") ?? null);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    let shouldUpdate = false;

    if (activeTab === "calendar") {
      if (nextParams.has("tab")) {
        nextParams.delete("tab");
        shouldUpdate = true;
      }
    } else if (nextParams.get("tab") !== activeTab) {
      nextParams.set("tab", activeTab);
      shouldUpdate = true;
    }

    if (!selectedDate) {
      if (nextParams.has("date")) {
        nextParams.delete("date");
        shouldUpdate = true;
      }
    } else if (nextParams.get("date") !== selectedDate) {
      nextParams.set("date", selectedDate);
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [activeTab, selectedDate, searchParams, setSearchParams]);

  // 日付フィルタリング・ソートの計算ロジック
  const { selectedDateSchedules, pastSchedules, futureSchedules } = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    const filterRealCategory = (list: Schedule[]) =>
      list.filter((s) => s.category !== "リアル");

    const filtered = filterRealCategory(schedules);

    return {
      selectedDateSchedules: selectedDate
        ? schedules.filter((s) => s.date === selectedDate)
        : [],

      // 1. 過去リスト：日付があって、今日より前のものを降順（新しい順）
      pastSchedules: filtered
        .filter((s) => s.date && s.date < todayStr)
        .sort((a, b) => b.date!.localeCompare(a.date!)),

      // 2. 未来リスト：今日以降の予定 ＋ 日付未定（null/なし）の予定
      futureSchedules: filtered
        .filter((s) => !s.date || s.date >= todayStr)
        .sort((a, b) => {
          // 日付なし（未定）は一番下に回す
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          // 日付があるものは昇順（近い未来が上）
          return a.date.localeCompare(b.date);
        }),
    };
  }, [schedules, selectedDate]);

  if (loading) {
    return (
      <div className="loading-container">
        <Sparkles className="loading-icon" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <main className="main-container">
      <div className="bg-overlay" />

      <div className="main-content-wrapper">
        {/* タブ切り替え */}
        <div className="tab-wrapper">
          <ScheduleTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* カレンダー タブ */}
        {activeTab === "calendar" && (
          <div className="calendar-tab-content">
            <div className="neon-wrapper-calendar">
              <div className="neon-inner-calendar">
                <ScheduleCalendar
                  schedules={schedules}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                />
              </div>
            </div>

            {/* 選択日の予定 */}
            {selectedDate && (
              <section className="selected-date-section">
                <ScheduleList
                  schedules={selectedDateSchedules}
                  emptyMessage={
                    <>
                      <CalendarX className="empty-schedule-icon" />
                      <span>この日の予定はありません</span>
                    </>
                  }
                />
              </section>
            )}
          </div>
        )}

        {/* リスト -過去- タブ */}
        {activeTab === "past" && (
          <section className="tab-section">
            <ScheduleList
              schedules={pastSchedules}
              emptyMessage="過去の予定はありません"
            />
          </section>
        )}

        {/* リスト -未来- タブ */}
        {activeTab === "future" && (
          <section className="tab-section">
            <ScheduleList
              schedules={futureSchedules}
              emptyMessage="これからの予定はありません"
            />
          </section>
        )}
      </div>
    </main>
  );
}
