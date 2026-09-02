import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import Holidays from "date-holidays";
import type { Schedule } from "../../types/schedule";
import "./ScheduleCalendar.css";

const hd = new Holidays("JP");

type Props = {
  schedules: Schedule[];
  selectedDate?: string | null;
  onSelectDate: (date: string) => void;
};

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStarClass(category?: string | null): string {
  switch (category) {
    case "ゲーム":
      return "calendar-star-game";
    case "シナリオ":
      return "calendar-star-scenario";
    default:
      return "calendar-star-real";
  }
}

export default function ScheduleCalendar({
  schedules,
  selectedDate,
  onSelectDate,
}: Props) {
  const [activeDate, setActiveDate] = useState(new Date());

  const todayStr = useMemo(() => formatDateKey(new Date()), []);
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, i) => currentYear - 2 + i),
    [currentYear]
  );

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    schedules.forEach((schedule) => {
      if (!schedule.date || schedule.date.trim() === "") return;
      const list = map.get(schedule.date) ?? [];
      list.push(schedule);
      map.set(schedule.date, list);
    });
    return map;
  }, [schedules]);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(activeDate);
    nextDate.setDate(1);
    nextDate.setMonth(nextDate.getMonth() + offset);
    setActiveDate(nextDate);
  };

  return (
    <div className="schedule-calendar font-pop">
      {/* 自作ヘッダー */}
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => changeMonth(-1)}
          aria-label="前月へ"
        >
          ✦
        </button>

        <div className="calendar-header-center">
          <select
            value={activeDate.getFullYear()}
            onChange={(e) => {
              const nextDate = new Date(activeDate);
              nextDate.setDate(1);
              nextDate.setFullYear(Number(e.target.value));
              setActiveDate(nextDate);
            }}
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>

          <select
            value={activeDate.getMonth()}
            onChange={(e) => {
              const nextDate = new Date(activeDate);
              nextDate.setDate(1);
              nextDate.setMonth(Number(e.target.value));
              setActiveDate(nextDate);
            }}
          >
            {Array.from({ length: 12 }, (_, i) => i).map((month) => (
              <option key={month} value={month}>
                {month + 1}月
              </option>
            ))}
          </select>

          <button
            type="button"
            className="calendar-today-button"
            onClick={() => {
              const today = new Date();
              setActiveDate(today);
              onSelectDate(formatDateKey(today));
            }}
          >
            今日
          </button>
        </div>

        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => changeMonth(1)}
          aria-label="次月へ"
        >
          ✦
        </button>
      </div>

      {/* カレンダー本体 */}
      <Calendar
        showNavigation={false}
        activeStartDate={activeDate}
        onActiveStartDateChange={({ activeStartDate }) => {
          if (activeStartDate) setActiveDate(activeStartDate);
        }}
        selectRange={false}
        prev2Label={null}
        next2Label={null}
        showNeighboringMonth={false}
        onChange={(value) => {
          if (value instanceof Date) {
            onSelectDate(formatDateKey(value));
          }
        }}
        formatShortWeekday={(_, date) =>
          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]
        }
        formatDay={(_, date) => String(date.getDate())}
        tileClassName={({ date }) => {
          const dateStr = formatDateKey(date);
          const classes: string[] = [];

          if (schedulesByDate.has(dateStr)) classes.push("has-schedule");
          if (dateStr === todayStr) classes.push("is-today");
          if (dateStr === selectedDate) classes.push("is-selected");

          const day = date.getDay();
          if (day === 6) classes.push("calendar-saturday");
          else if (day === 0) classes.push("calendar-sunday");

          if (hd.isHoliday(date)) classes.push("calendar-holiday");

          return classes.join(" ");
        }}
        tileContent={({ date, view }) => {
          if (view !== "month") return null;

          const key = formatDateKey(date);
          const daySchedules = schedulesByDate.get(key);
          if (!daySchedules) return null;

          return (
            <div className="calendar-stars">
              {daySchedules.slice(0, 3).map((schedule, i) => (
                <span
                  key={schedule.id ?? `${key}-${i}`}
                  className={`calendar-star ${getStarClass(schedule.category)}`}
                >
                  ✦
                </span>
              ))}
            </div>
          );
        }}
      />
    </div>
  );
}