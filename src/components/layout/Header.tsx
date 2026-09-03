import { NavLink } from "react-router-dom";
import { CalendarDays, BookOpen } from "lucide-react";
import "./Header.css";

// -------------------------------------------------------------
// ヘッダー右側のページ遷移ナビゲーション設定
// -------------------------------------------------------------
const NAV_ITEMS = [
  { to: "/", label: "スケジュール", icon: CalendarDays, end: true },
  { to: "/scenario", label: "シナリオ", icon: BookOpen, end: false },
] as const;

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <h1 className="site-title font-pop">
          星降る止まり木
        </h1>

        <nav className="site-nav font-pop" aria-label="ページ切り替え">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `site-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={16} className="site-nav-icon" />
              <span className="site-nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
