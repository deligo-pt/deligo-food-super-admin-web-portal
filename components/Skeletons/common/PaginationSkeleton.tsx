const PaginationSkeleton = () => {
  return (
    <div className="flex items-center justify-between pt-4">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 w-28 rounded-md bg-muted-foreground/20 animate-pulse" />
    </div>
  );
};

export default PaginationSkeleton;
