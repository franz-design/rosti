import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import type { Attendance } from '@/lib/rosti-api'
import {
  attendancesQueryKey,
  rollbackOptimisticAttendance,
  setOptimisticAttendance,
} from './optimistic-attendance'

function attendance(userId: string, status: Attendance['status']): Attendance {
  return {
    id: userId,
    matchId: 'match-1',
    userId,
    userName: userId,
    status,
  }
}

describe('setOptimisticAttendance', () => {
  it('updates the cached status before the server answers', async () => {
    const queryClient = new QueryClient()
    const queryKey = attendancesQueryKey('org-1', 'match-1')
    queryClient.setQueryData(queryKey, [
      attendance('user-1', 'pending'),
      attendance('user-2', 'absent'),
    ])

    await setOptimisticAttendance({
      queryClient,
      orgId: 'org-1',
      matchId: 'match-1',
      userId: 'user-1',
      status: 'present',
    })

    expect(queryClient.getQueryData<Attendance[]>(queryKey)).toEqual([
      attendance('user-1', 'present'),
      attendance('user-2', 'absent'),
    ])
  })

  it('restores only the player whose request failed', async () => {
    const queryClient = new QueryClient()
    const queryKey = attendancesQueryKey('org-1', 'match-1')
    queryClient.setQueryData(queryKey, [
      attendance('user-1', 'pending'),
      attendance('user-2', 'pending'),
    ])

    const context = await setOptimisticAttendance({
      queryClient,
      orgId: 'org-1',
      matchId: 'match-1',
      userId: 'user-1',
      status: 'present',
    })
    await setOptimisticAttendance({
      queryClient,
      orgId: 'org-1',
      matchId: 'match-1',
      userId: 'user-2',
      status: 'absent',
    })

    rollbackOptimisticAttendance(queryClient, 'org-1', 'match-1', context)

    expect(queryClient.getQueryData<Attendance[]>(queryKey)).toEqual([
      attendance('user-1', 'pending'),
      attendance('user-2', 'absent'),
    ])
  })

  it('keeps a newer choice when an older request fails', async () => {
    const queryClient = new QueryClient()
    const queryKey = attendancesQueryKey('org-1', 'match-1')
    queryClient.setQueryData(queryKey, [attendance('user-1', 'pending')])

    const first = await setOptimisticAttendance({
      queryClient,
      orgId: 'org-1',
      matchId: 'match-1',
      userId: 'user-1',
      status: 'present',
    })
    await setOptimisticAttendance({
      queryClient,
      orgId: 'org-1',
      matchId: 'match-1',
      userId: 'user-1',
      status: 'absent',
    })

    rollbackOptimisticAttendance(queryClient, 'org-1', 'match-1', first)

    expect(queryClient.getQueryData<Attendance[]>(queryKey)).toEqual([
      attendance('user-1', 'absent'),
    ])
  })
})
