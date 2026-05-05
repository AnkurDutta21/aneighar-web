import React from 'react'

const PGCardSkeleton: React.FC = () => (
  <div className="pg-card overflow-hidden">
    <div className="skeleton" style={{ aspectRatio: '16/10' }} />
    <div className="p-4 flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="skeleton h-5 flex-1 rounded" />
        <div className="skeleton h-5 w-14 rounded" />
      </div>
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="flex gap-3">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-12 rounded" />
      </div>
    </div>
  </div>
)

export const PGGridSkeleton: React.FC<{ count?: number }> = ({ count = 9 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <PGCardSkeleton key={i} />
    ))}
  </div>
)

export default PGCardSkeleton
