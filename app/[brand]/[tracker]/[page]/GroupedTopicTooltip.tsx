"use client";

function changePillProps(
  change: number | undefined | null,
  isPosition: boolean
): { text: string; className: string; showPts: boolean } {
  const hasChange = change != null && Number.isFinite(change);
  const changeGood = hasChange && (isPosition ? change! < 0 : change! > 0);
  const changeBad = hasChange && (isPosition ? change! > 0 : change! < 0);
  const className =
    changeGood
      ? "bg-emerald-50 text-emerald-700"
      : changeBad
        ? "bg-red-50 text-red-600"
        : hasChange
          ? "bg-[#f0f0f0] text-[#525252]"
          : "bg-[#f0f0f0] text-[#999]";
  const text =
    hasChange && change !== 0
      ? `${change! > 0 ? "▲" : "▼"} ${Math.abs(change!).toFixed(1)}`
      : hasChange
        ? "0"
        : "—";
  return { text, className, showPts: hasChange && change !== 0 };
}

export interface GroupedTopicTooltipProps {
  topicLabel: string;
  topicIndex: number;
  models: { id: string; label: string; values: number[]; changes?: number[] }[];
  averages: number[];
  averageChanges?: number[];
  isPosition: boolean;
  formatScore: (v: number) => string;
  getModelBarColor: (label: string, index: number) => string;
  style: React.CSSProperties;
  /** Optional line at bottom, e.g. "Compare to 15 Jan 2025" */
  compareToDateLabel?: string;
  /** When true, tooltip content is right-aligned (e.g. for non-last columns) */
  alignRight?: boolean;
}

export function GroupedTopicTooltip({
  topicLabel,
  topicIndex,
  models,
  averages,
  averageChanges,
  isPosition,
  formatScore,
  getModelBarColor,
  style,
  compareToDateLabel,
  alignRight = false,
}: GroupedTopicTooltipProps) {
  const avgValue = averages[topicIndex];
  const avgChange = averageChanges?.[topicIndex];
  const avgPill = changePillProps(avgChange, isPosition);
  const textAlign = alignRight ? "text-right" : "text-left";

  return (
    <div
      className={`absolute z-10 pointer-events-none rounded-lg border border-[#e5e5e5] bg-white shadow-lg py-2 px-3 min-w-[10rem] max-w-[14rem] will-change-[left] ${textAlign}`}
      style={style}
    >
      <p className={`text-xs font-semibold text-[#262626] mb-2 border-b border-[#e5e5e5] pb-1.5 ${textAlign}`}>
        {topicLabel}
      </p>
      <div className="space-y-1">
        {/* Average first */}
        {avgValue != null && (
          <div className="flex items-center justify-between gap-4 text-xs w-full pb-1.5 mb-1.5 border-b border-[#e5e5e5]">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0 bg-[var(--primary-dark)]" />
              <span className="text-[#525252]">Average</span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="font-medium tabular-nums text-[#262626]">
                {formatScore(avgValue)}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold tabular-nums uppercase tracking-wide ${avgPill.className}`}
              >
                {avgPill.text}
                {avgPill.showPts && " pts"}
              </span>
            </span>
          </div>
        )}
        {models.map((m, mi) => {
          const value = m.values[topicIndex] ?? 0;
          const change = m.changes?.[topicIndex];
          const pill = changePillProps(change, isPosition);
          return (
            <div
              key={m.id}
              className="flex items-center justify-between gap-4 text-xs w-full"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ backgroundColor: getModelBarColor(m.label, mi) }}
                />
                <span className="text-[#525252] truncate">{m.label}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="font-medium tabular-nums text-[#262626]">
                  {formatScore(value)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold tabular-nums uppercase tracking-wide ${pill.className}`}
                >
                  {pill.text}
                  {pill.showPts && " pts"}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      {compareToDateLabel && (
        <p className={`mt-2 pt-2 border-t border-[#e5e5e5] text-xs text-[#7F7F7F] ${textAlign}`}>
          Compare to {compareToDateLabel}
        </p>
      )}
    </div>
  );
}
