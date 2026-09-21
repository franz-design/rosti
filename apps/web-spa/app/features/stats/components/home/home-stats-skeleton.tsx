import { Skeleton } from '@rosti/ui/components/primitives/skeleton'

export function HomeStatsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-24 rounded-xl sm:col-span-2 xl:col-span-4" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
