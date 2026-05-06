import React from 'react'

export const PGCardSkeleton: React.FC = () => (
  <div className="glass-card overflow-hidden animate-fade-in">
    <div className="skeleton rounded-none" style={{ aspectRatio: '16/10' }} />
    <div className="p-4 flex flex-col gap-3">
      <div className="skeleton h-4 rounded-lg w-3/4" />
      <div className="skeleton h-3 rounded-lg w-1/2" />
      <div className="flex gap-2 pt-2 border-t border-white/6">
        <div className="skeleton h-3 rounded w-16" />
        <div className="skeleton h-3 rounded w-16" />
      </div>
    </div>
  </div>
)

export const PGGridSkeleton: React.FC<{ count?: number }> = ({ count = 9 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <PGCardSkeleton key={i} />
    ))}
  </div>
)

export default PGCardSkeleton
