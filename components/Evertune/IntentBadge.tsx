export type IntentType = "Informational" | "Navigational" | "Commercial" | "Transactional";

export interface IntentBadgeProps {
  intent: IntentType;
}

export function IntentBadge({ intent }: IntentBadgeProps) {
  const getStyles = (): { bg: string; text: string } => {
    switch (intent) {
      case "Informational":
        return { bg: "#feeeed", text: "#bf392f" };
      case "Navigational":
        return { bg: "#e7e1ff", text: "#4d2cdd" };
      case "Commercial":
        return { bg: "#f6e1fe", text: "#7d18a8" };
      case "Transactional":
        return { bg: "#e0ffff", text: "#007575" };
    }
  };

  const styles = getStyles();

  return (
    <div
      className="inline-flex items-center justify-center px-2 py-1 rounded text-[11px] font-bold uppercase whitespace-nowrap"
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      {intent}
    </div>
  );
}
