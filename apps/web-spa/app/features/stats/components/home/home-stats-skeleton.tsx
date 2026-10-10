import { Skeleton } from '@rosti/ui/components/primitives/skeleton'

export function HomeStatsSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-6">
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-6 w-40" />
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(min(100%,15.5rem),18rem))] justify-center gap-4">
          <Skeleton className="aspect-[668/1024] w-full rounded-[1.75rem]" />
          <Skeleton className="aspect-[668/1024] w-full rounded-[1.75rem]" />
        </div>
      </div>
      <div className="w-full shrink-0 space-y-3 lg:w-80">
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
