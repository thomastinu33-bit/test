"use client";

interface ScoreGaugeProps {
  label: string;
  value: number;
  max: number;
  change?: number | null;
  arcColor: string;
  valueFormat?: (n: number) => string;
  inverse?: boolean;
  icon?: React.ReactNode;
}

export function ScoreGauge({
  label,
  value,
  max,
  change,
  arcColor,
  valueFormat = (n) => String(Math.round(n)),
  inverse = false,
  icon,
}: ScoreGaugeProps) {
  const size = 100;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const fillPct = inverse ? 1 - pct : pct;
  const strokeDashoffset = circumference * (1 - fillPct);

  const hasChange = change != null;
  const changeText =
    hasChange && change !== 0
      ? `${change > 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}`
      : hasChange ? "0" : "—";
  const changePositive = hasChange && change > 0;
  const changeNegative = hasChange && change < 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg]"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={arcColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
          <span className="text-2xl font-semibold tabular-nums text-[#262626]">
            {valueFormat(value)}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums uppercase tracking-wide ${
              changePositive
                ? "bg-emerald-50 text-emerald-700"
                : changeNegative
                  ? "bg-red-50 text-red-600"
                  : hasChange
                    ? "bg-[#f0f0f0] text-[#525252]"
                    : "text-[#999]"
            }`}
          >
            {changeText}
            {hasChange && change !== 0 && " pts"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        {icon && (
          <span className="flex-shrink-0 flex items-center justify-center [&>img]:max-w-[1.75rem] [&>img]:max-h-[1.75rem] [&>svg]:w-5 [&>svg]:h-5">
            {icon}
          </span>
        )}
        <span className="text-center text-sm font-medium text-[#262626]">
          {label}
        </span>
      </div>
    </div>
  );
}
