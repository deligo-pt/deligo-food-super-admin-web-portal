const FilterSkeleton = () => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="h-10 w-72 rounded-md bg-muted-foreground/20 animate-pulse" />
      <div className="flex gap-3">
        <div className="h-10 w-28 rounded-md bg-muted-foreground/20 animate-pulse" />
        <div className="h-10 w-24 rounded-md bg-muted-foreground/20 animate-pulse" />
      </div>
    </div>
  );
};

export default FilterSkeleton;
