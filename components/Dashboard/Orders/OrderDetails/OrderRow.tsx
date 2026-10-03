import { formatPrice } from "@/utils/formatPrice";

export const Row = ({
    label,
    value,
    highlight = false,
    negative = false,
}: {
    label: string;
    value: string | number;
    highlight?: boolean;
    negative?: boolean;
}) => (
    <div className={`flex justify-between ${highlight ? "font-semibold text-gray-900" : ""}`}>
        <span>{label}</span>
        <span className={negative ? "text-emerald-600" : ""}>
            {typeof value === "number" ? `€${formatPrice(value)}` : value}
        </span>
    </div>
);