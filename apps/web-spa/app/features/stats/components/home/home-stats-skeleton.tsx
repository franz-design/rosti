import { Skeleton } from '@rosti/ui/components/primitives/skeleton'

export function HomeStatsSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-6">
      <div className="min-w-0 space-y-3 lg:w-max lg:max-w-full lg:shrink">
        <Skeleton className="h-6 w-40" />
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row">
          <Skeleton className="aspect-[668/1024] w-full max-w-72 rounded-[1.75rem] sm:w-72" />
          <Skeleton className="aspect-[668/1024] w-full max-w-72 rounded-[1.75rem] sm:w-72" />
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-3 lg:min-w-72">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
