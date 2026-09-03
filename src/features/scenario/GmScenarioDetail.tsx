import type { MouseEvent } from "react";
import { ArrowLeft, Building2, Image as ImageIcon, Link as LinkIcon, PenLine, Radio, Sparkles, Tag as TagIcon, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useGmScenarioDetail } from "./useGmScenarioDetail";
import { confirmSpoilerWarning } from "./spoilerWarning";
import WatermarkedImage from "../../WatermarkedImage";
import "./ReportDetail.css";
import "./GmAvailable.css";

function getGenreClass(genre?: string | null) {
  if (!genre) return "schedule-genre-default";
  if (genre.includes("マダミス") || genre.includes("マーダーミステリー")) return "schedule-genre-mystery";
  if (genre.includes("ストプレ") || genre.includes("ストーリープレイ")) return "schedule-genre-story";
  return "schedule-genre-other";
}

export default function GmScenarioDetail() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const { detail, loading, error } = useGmScenarioDetail(scenarioId);
  if (loading) return <div className="loading-container"><Sparkles className="loading-icon" /><span>読み込み中...</span></div>;
  if (error || !detail) return <div className="empty-schedule-box"><span>データが見つかりませんでした。</span></div>;
  const { scenario } = detail;
  const handleStreamClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!confirmSpoilerWarning()) {
      e.preventDefault();
    }
  };

  return <div className="report-detail gm-detail font-yomogi">
    <button type="button" className="report-back-link font-pop" onClick={() => navigate("/scenario/gm")}><ArrowLeft size={16} />GM可能一覧へ戻る</button>
    <div className="report-detail-body">
      <div className="report-detail-tags font-pop">{scenario.genre && <span className={`report-detail-genre ${getGenreClass(scenario.genre)}`}>#{scenario.genre}</span>}{scenario.playerCount && <span className="report-detail-scenario-tag"><Users size={12} />{scenario.playerCount} PL</span>}{scenario.scenarioTag && <span className="report-detail-scenario-tag"><TagIcon size={12} />{scenario.scenarioTag}</span>}</div>
      <h1 className="report-detail-title font-pop">{scenario.title}</h1>
      <div className="report-detail-info-group">
        {scenario.production && <span className="report-detail-item"><Building2 size={14} />制作：{scenario.productionUrl ? <a href={scenario.productionUrl} target="_blank" rel="noreferrer">{scenario.production}</a> : scenario.production}</span>}
        {scenario.creator && <span className="report-detail-item"><PenLine size={14} />作者様：{scenario.creatorUrl ? <a href={scenario.creatorUrl} target="_blank" rel="noreferrer">{scenario.creator}</a> : scenario.creator}</span>}
      </div>
      {scenario.officialUrl && <div className="report-detail-links"><a className="report-detail-link-btn official-btn" href={scenario.officialUrl} target="_blank" rel="noreferrer"><LinkIcon size={14} />公式ページ</a></div>}
      {scenario.synopsis && <section className="gm-text-section"><h2 className="font-pop">あらすじ</h2><p>{scenario.synopsis}</p></section>}
      {scenario.summary && <section className="gm-text-section"><h2 className="font-pop">概要</h2><p>{scenario.summary}</p></section>}
      {scenario.trailerUrl && <section className="report-cover-section"><h2 className="report-cast-heading font-pop"><ImageIcon size={18} />トレーラー</h2><div className="report-detail-cover-wrapper"><WatermarkedImage src={scenario.trailerUrl} alt={scenario.title} className="report-detail-cover" /></div></section>}
    </div>
    <section className="report-cast-section"><h2 className="report-cast-heading font-pop"><Users size={18} />これまでのGM卓履歴</h2>{detail.history.length === 0 ? <div className="empty-schedule-box">履歴はありません</div> : <div className="report-cast-table-wrapper"><table className="report-cast-table"><thead><tr><th>日付</th><th>PLメンバー</th><th>配信URL</th></tr></thead><tbody>{detail.history.map((history) => <tr key={history.scheduleId}><td>{history.date}</td><td>{history.members.join("、") || "-"}</td><td>{history.streamUrl ? <a className="report-detail-link-btn stream-btn gm-history-stream-btn" href={history.streamUrl} target="_blank" rel="noreferrer" onClick={handleStreamClick} aria-label={`${history.date}の配信を見る`}><Radio size={14} />配信を見る</a> : "-"}</td></tr>)}</tbody></table></div>}</section>
  </div>;
}
