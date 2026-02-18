const SkeletonBase = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
  );
};

export default SkeletonBase;
