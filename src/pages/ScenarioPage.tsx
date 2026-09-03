import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BookMarked, Cross } from "lucide-react";
import ReportBookshelf from "../features/scenario/ReportBookshelf";
import GmAvailableList from "../features/scenario/GmAvailableList";
import GmScenarioDetail from "../features/scenario/GmScenarioDetail";
import "./ScenarioPage.css";

// 「通過予定」タブは廃止し、通過報告に統合しました
const SCENARIO_TABS = [
  { to: "/scenario/passed", label: "通過報告", icon: BookMarked },
  { to: "/scenario/gm", label: "GM可能", icon: Cross },
] as const;

export default function ScenarioPage() {
  const { pathname } = useLocation();
  const isGmDetail = pathname.startsWith("/scenario/gm/");

  return (
    <main className="main-container">
      <div className="bg-overlay" />

      <div className="main-content-wrapper">
        {!isGmDetail && (
          <div className="tab-wrapper">
            <div className="scenario-tabs-container font-pop">
              <div className="scenario-tabs">
                {SCENARIO_TABS.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end
                    className={({ isActive }) => `scenario-tab-btn ${isActive ? "active" : ""}`}
                  >
                    <Icon size={18} className="scenario-tab-icon" />
                    <span className="scenario-tab-label">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}

        <section className="tab-section">
          <Routes>
            <Route index element={<Navigate to="passed" replace />} />
            <Route path="passed" element={<ReportBookshelf />} />
            <Route path="gm" element={<GmAvailableList />} />
            <Route path="gm/:scenarioId" element={<GmScenarioDetail />} />
            {/* 旧「通過予定」URLへのアクセスは通過報告へリダイレクト */}
            <Route path="upcoming" element={<Navigate to="/scenario/passed" replace />} />
          </Routes>
        </section>
      </div>
    </main>
  );
}
