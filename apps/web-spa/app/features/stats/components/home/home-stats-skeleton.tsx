import { Skeleton } from '@rosti/ui/components/primitives/skeleton'

export function HomeStatsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
          <Skeleton className="aspect-[656/1023] w-full max-w-80 rounded-[2rem] lg:w-80" />
          <div className="grid w-full min-w-0 flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-24 rounded-xl sm:col-span-2 lg:col-span-3" />
          </div>
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
