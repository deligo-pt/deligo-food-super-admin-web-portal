interface IProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, color, onChange }: IProps) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#DC3173] transition-colors bg-white group">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full shadow-sm border border-gray-200"
          style={{
            backgroundColor: color,
          }}
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          <span className="text-xs text-gray-500 uppercase">{color}</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <button className="text-xs font-medium text-[#DC3173] hover:text-[#b0275c] px-2 py-1 rounded hover:bg-pink-50 transition-colors">
          Change
        </button>
      </div>
    </div>
  );
}
