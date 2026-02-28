import SkeletonBase from "@/components/Skeletons/common/SkeletonBase";

const TableSkeleton = ({
  rows = 10,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-xl overflow-hidden p-4">
      <div
        className={`bg-gray-100 rounded-xl gap-4 px-4 grid grid-cols-${cols}`}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBase key={i} className="h-4 w-full my-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`border-b border-gray-200 gap-4 px-4 grid grid-cols-${cols}`}
        >
          {Array.from({ length: cols }).map((_, i) => (
            <SkeletonBase key={i} className="h-3 w-full my-4" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
