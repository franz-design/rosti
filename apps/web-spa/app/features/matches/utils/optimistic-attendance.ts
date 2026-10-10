import type { QueryClient } from '@tanstack/react-query'
import type { Attendance } from '@/lib/rosti-api'

export function attendancesQueryKey(orgId: string | undefined, matchId: string | undefined) {
  return ['attendances', orgId, matchId] as const
}

interface OptimisticAttendanceContext {
  previous?: Attendance[]
  userId: string
  status: Attendance['status']
}

/**
 * Shows the new attendance immediately, before the server answers.
 * A later click on the same player is left in place if this request fails.
 */
export async function setOptimisticAttendance({
  queryClient,
  orgId,
  matchId,
  userId,
  status,
}: {
  queryClient: QueryClient
  orgId: string
  matchId: string
  userId: string
  status: Attendance['status']
}): Promise<OptimisticAttendanceContext> {
  const queryKey = attendancesQueryKey(orgId, matchId)
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData<Attendance[]>(queryKey)
  queryClient.setQueryData<Attendance[]>(queryKey, (current) =>
    patchAttendanceStatus(current, userId, status),
  )
  return { previous, userId, status }
}

export function rollbackOptimisticAttendance(
  queryClient: QueryClient,
  orgId: string,
  matchId: string,
  context: OptimisticAttendanceContext | undefined,
): void {
  if (!context?.previous) return
  queryClient.setQueryData<Attendance[]>(attendancesQueryKey(orgId, matchId), (current) =>
    restoreAttendanceStatus(current, context),
  )
}

function patchAttendanceStatus(
  attendances: Attendance[] | undefined,
  userId: string,
  status: Attendance['status'],
): Attendance[] | undefined {
  if (!attendances) return attendances
  return attendances.map((attendance) =>
    attendance.userId === userId ? { ...attendance, status } : attendance,
  )
}

function restoreAttendanceStatus(
  current: Attendance[] | undefined,
  context: OptimisticAttendanceContext,
): Attendance[] | undefined {
  if (!context.previous) return current
  if (!current) return context.previous
  const previousAttendance = context.previous.find(
    (attendance) => attendance.userId === context.userId,
  )
  if (!previousAttendance) return current
  return current.map((attendance) => {
    if (attendance.userId !== context.userId) return attendance
    if (attendance.status !== context.status) return attendance
    return previousAttendance
  })
}
