export default function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-2">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-gray-800 text-sm font-medium">{value}</div>
    </div>
  );
}
