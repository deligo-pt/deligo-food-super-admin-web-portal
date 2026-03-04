

const StatusDistributionCard = ({ name, value, color }: { name: string; value: number; color: string }) => {
    return (
        <div
            key={name}
            className="flex items-center justify-between"
        >
            <div className="flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{
                        backgroundColor: color,
                    }}
                />
                <span className="text-sm text-gray-600">{name}</span>
            </div>
            <span className="font-bold text-gray-900">{value}</span>
        </div>
    );
};

export default StatusDistributionCard;