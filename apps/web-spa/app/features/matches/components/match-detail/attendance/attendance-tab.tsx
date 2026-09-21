import { useTranslation } from 'react-i18next'
import type { Attendance } from '@/lib/rosti-api'
import { AttendanceGroup } from './attendance-group'
import { AttendanceManager } from './attendance-manager'

interface AttendanceTabProps {
  canManage: boolean
  sortedAttendances: Attendance[]
  attendanceGroups: {
    present: Attendance[]
    pending: Attendance[]
    absent: Attendance[]
  }
  busyUserId: string | null
  onSetStatus: (userId: string, status: 'present' | 'absent' | 'pending') => void
}

export function AttendanceTab({
  canManage,
  sortedAttendances,
  attendanceGroups,
  busyUserId,
  onSetStatus,
}: AttendanceTabProps) {
  const { t } = useTranslation()

  if (canManage) {
    return (
      <AttendanceManager
        players={sortedAttendances}
        busyUserId={busyUserId}
        onSetStatus={onSetStatus}
      />
    )
  }

  return (
    <>
      <AttendanceGroup
        title={t('matches.detail.attendance.present')}
        players={attendanceGroups.present}
        emptyLabel={t('matches.detail.attendance.empty')}
      />
      <AttendanceGroup
        title={t('matches.detail.attendance.pending')}
        players={attendanceGroups.pending}
        emptyLabel={t('matches.detail.attendance.empty')}
      />
      <AttendanceGroup
        title={t('matches.detail.attendance.absent')}
        players={attendanceGroups.absent}
        emptyLabel={t('matches.detail.attendance.empty')}
      />
    </>
  )
}
