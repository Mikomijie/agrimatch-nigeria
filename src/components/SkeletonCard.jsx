function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      <div className="h-40 bg-[var(--color-surface)]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[var(--color-surface)] rounded w-2/3" />
        <div className="h-3 bg-[var(--color-surface)] rounded w-1/2" />
        <div className="h-3 bg-[var(--color-surface)] rounded w-1/3" />
        <div className="mt-4 pt-3 border-t border-black/5 space-y-2">
          <div className="h-8 bg-[var(--color-surface)] rounded" />
          <div className="h-8 bg-[var(--color-surface)] rounded" />
        </div>
      </div>
    </div>
  )
}

export default SkeletonCard