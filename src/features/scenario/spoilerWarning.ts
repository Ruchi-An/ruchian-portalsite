export const SPOILER_WARNING_MESSAGE =
  "⚠️ ネタバレ注意 ⚠️\n\nこの配信はシナリオ（マダミス・ストプレ等）のネタバレを含みます。\n通過済み、または今後プレイ予定のない方のみご視聴ください。\n\n配信ページを開きますか？";

export function confirmSpoilerWarning() {
  return window.confirm(SPOILER_WARNING_MESSAGE);
}
