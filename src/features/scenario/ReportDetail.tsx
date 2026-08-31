import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  CalendarDays,
  PenLine,
  Building2,
  Link as LinkIcon,
  Radio,
  Users,
  X,
  Tag as TagIcon,
  Hash,
  Image as ImageIcon, // 💡 エンドカード用アイコンを追加
} from "lucide-react";
import { useScenarioReportDetail } from "./useScenarioReportDetail";
import WatermarkedImage from "../../WatermarkedImage";
import "./ReportDetail.css";

export default function ReportDetail() {
  const location = useLocation();
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const { detail, loading, error } = useScenarioReportDetail(scheduleId);
  const returnView = (location.state as { returnView?: "bookshelf" | "list" } | null)?.returnView ?? "bookshelf";

  // 💡 画像モーダルの開閉状態
  const [isImageOpen, setIsImageOpen] = useState(false);

  // 💡 キャストの並び替え（GM/STを先頭、PLは番号順）
  const sortedCast = useMemo(() => {
    if (!detail?.cast) return [];

    return [...detail.cast].sort((a, b) => {
      const roleA = (a.role || "").toUpperCase();
      const roleB = (b.role || "").toUpperCase();

      const isGmA = roleA === "GM" || roleA === "ST";
      const isGmB = roleB === "GM" || roleB === "ST";

      if (isGmA && !isGmB) return -1;
      if (!isGmA && isGmB) return 1;

      return (a.characterNumber ?? 0) - (b.characterNumber ?? 0);
    });
  }, [detail?.cast]);

  // 💡 担当キャラクターの描画テキストを判定するHelper関数
  const getCharacterLabel = (member: (typeof sortedCast)[number]) => {
    const role = (member.role || "").toUpperCase();

    if (role === "GM" || role === "ST") {
      return "-";
    }

    const disclosure = detail?.scenario?.characterDisclosure ?? "名前公開OK";

    if (disclosure === "公開NG") {
      return "-";
    }

    const type = member.characterType ?? "PC";
    const numStr = member.characterNumber ? `${type}${member.characterNumber}` : "";
    const charName = member.characterName ?? "";

    if (disclosure === "順番のみ公開OK") {
      return numStr || "-";
    }

    return [numStr, charName].filter(Boolean).join(" ") || "-";
  };

  // 💡 ジャンルに応じたCSSクラスを取得するHelper関数
  const getGenreClass = (genre?: string) => {
    if (!genre) return "schedule-genre-default";
    if (genre.includes("マダミス") || genre.includes("マーダーミステリー")) {
      return "schedule-genre-mystery";
    }
    if (genre.includes("ストプレ") || genre.includes("ストーリープレイ")) {
      return "schedule-genre-story";
    }
    return "schedule-genre-other";
  };

  const handleStreamClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isConfirmed = window.confirm(
      "⚠️ ネタバレ注意 ⚠️\n\nこの配信はシナリオ（マダミス・ストプレ等）のネタバレを含みます。\n通過済み、または今後プレイ予定のない方のみご視聴ください。\n\n配信ページを開きますか？"
    );
    if (!isConfirmed) {
      e.preventDefault();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Sparkles className="loading-icon" />
        <span>読み込み中...</span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="empty-schedule-box">
        <span>データが見つかりませんでした。</span>
      </div>
    );
  }

  const { scenario } = detail;
  // 💡 scenarioTag（キャメルケース）と scenario_tag（スネークケース）の両方をケア
  const scenarioTagValue = (scenario as any)?.scenarioTag ?? (scenario as any)?.scenario_tag;

  // 💡 (detail as any) を使うことで TypeScript の型エラーを回避！
  const passingNumber = (detail as any).number ?? (detail as any).passingNumber;

  return (
    <div className="report-detail">
      <Link
        to="/scenario/passed"
        state={{ returnView }}
        className="report-back-link font-pop"
      >
        <ArrowLeft size={16} />
        {returnView === "list" ? "リストへ戻る" : "本棚に戻る"}
      </Link>

      {/* 詳細情報エリア */}
      <div className="report-detail-body">
        {/* タグエリア */}
        <div className="report-detail-tags">
          {scenario?.genre && (
            <span className={`report-detail-genre font-pop ${getGenreClass(scenario.genre)}`}>
              #{scenario.genre}
            </span>
          )}
          {scenarioTagValue && (
            <span className="report-detail-scenario-tag font-pop">
              <TagIcon size={12} />
              {scenarioTagValue}
            </span>
          )}
        </div>

        <h1 className="report-detail-title font-pop">
          {scenario?.title ?? "タイトル未設定"}
        </h1>

        {/* メタ・クレジット情報エリア */}
        <div className="report-detail-info-group font-yomogi">
          <span className="report-detail-item">
            <CalendarDays size={14} />
            通過日：{detail.date}
          </span>

          {/* 💡 連番（通過番号）の表示箇所 */}
          {passingNumber !== undefined && passingNumber !== null && (
            <span className="report-detail-item">
              <Hash size={14} />
              通過番号：#{passingNumber}
            </span>
          )}

          {(scenario?.creator || scenario?.production) && (
            <>
              {scenario?.production && (
                <span className="report-detail-item">
                  <Building2 size={14} />
                  制作：
                  {scenario.productionUrl ? (
                    <a href={scenario.productionUrl} target="_blank" rel="noopener noreferrer">
                      {scenario.production}
                    </a>
                  ) : (
                    scenario.production
                  )}
                </span>
              )}
              {scenario?.creator && (
                <span className="report-detail-item">
                  <PenLine size={14} />
                  作者様：
                  {scenario.creatorUrl ? (
                    <a href={scenario.creatorUrl} target="_blank" rel="noopener noreferrer">
                      {scenario.creator}
                    </a>
                  ) : (
                    scenario.creator
                  )}
                </span>
              )}
            </>
          )}
        </div>

        {/* 公式・配信リンク */}
        <div className="report-detail-links font-yomogi">
          {scenario?.officialUrl && (
            <a href={scenario.officialUrl} target="_blank" rel="noopener noreferrer" className="report-detail-link-btn official-btn">
              <LinkIcon size={14} /> 公式ページ
            </a>
          )}
          {detail.streamUrl && (
            <a href={detail.streamUrl} target="_blank" rel="noopener noreferrer" onClick={handleStreamClick} className="report-detail-link-btn stream-btn">
              <Radio size={14} /> 配信を見る
            </a>
          )}
        </div>
      </div>

      {/* 参加メンバー */}
      <section className="report-cast-section">
        <h2 className="report-cast-heading font-pop">
          <Users size={18} />
          参加メンバー
        </h2>

        {sortedCast.length === 0 ? (
          <div className="empty-schedule-box font-yomogi">
            <span>参加メンバー情報は登録されていません</span>
          </div>
        ) : (
          <div className="report-cast-table-wrapper font-yomogi">
            <table className="report-cast-table">
              <thead>
                <tr>
                  <th>参加者</th>
                  <th>役割</th>
                  <th>担当</th>
                </tr>
              </thead>
              <tbody>
                {sortedCast.map((member) => (
                  <tr key={member.participantId}>
                    <td className="cast-col-user">{member.profileName || "-"}</td>
                    <td className="cast-col-role">{member.role || "-"}</td>
                    <td className="cast-col-char">{getCharacterLabel(member)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* エンドカード (一番下) */}
      {detail.endcardUrl && (
        <section className="report-cover-section">
          <h2 className="report-cast-heading font-pop">
            <ImageIcon size={18} />
            エンドカード
          </h2>

          <div className="report-detail-cover-wrapper">
            <WatermarkedImage
              src={detail.endcardUrl}
              alt={scenario?.title ?? ""}
              className="report-detail-cover clickable"
              onClick={() => setIsImageOpen(true)}
            />
          </div>
        </section>
      )}

      {/* モーダル表示 */}
      {isImageOpen && detail.endcardUrl && createPortal(
        <div className="image-modal-overlay" onClick={() => setIsImageOpen(false)}>
          <button className="image-modal-close" onClick={() => setIsImageOpen(false)}>
            <X size={24} />
          </button>
          
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <WatermarkedImage
              src={detail.endcardUrl}
              alt="拡大エンドカード"
              className="image-modal-view"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}