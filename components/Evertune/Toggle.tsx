export interface ToggleProps<T extends string = string> {
  options: T[];
  value: T;
  onChange: (value: T) => void;
}

export function Toggle<T extends string = string>({ options, value, onChange }: ToggleProps<T>) {
  return (
    <div className="bg-[#F6F6F6] border border-[#EEE] flex items-center p-1 rounded-lg w-fit">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            value === option
              ? "bg-white text-[#262626] shadow-[2px_2px_8px_rgba(0,0,0,0.1)]"
              : "bg-transparent text-[#262626] hover:bg-[#F0F0F0]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
