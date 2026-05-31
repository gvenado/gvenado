import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  className?: string
  count?: number
}

export function SkeletonLoader({ className, count = 1 }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('animate-pulse rounded-lg bg-[#E5E7EB]/60', className)}
        />
      ))}
    </>
  )
}

export function InputSkeleton() {
  return (
    <div className="space-y-2">
      <SkeletonLoader className="h-3.5 w-20" />
      <SkeletonLoader className="h-12 w-full rounded-xl" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] p-4 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonLoader className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader className="h-3.5 w-2/3" />
          <SkeletonLoader className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}
