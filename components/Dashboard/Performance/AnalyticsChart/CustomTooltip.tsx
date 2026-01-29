interface IProps {
  active?: boolean;
  payload?: string;
  label?: string;
}

export default function CustomTooltip({ active, payload, label }: IProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl">
        <p className="font-medium">{label}</p>
        <p className="text-brand-300">{payload}</p>
      </div>
    );
  }
  return null;
}
