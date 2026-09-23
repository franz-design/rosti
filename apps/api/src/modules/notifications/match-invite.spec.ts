import { describe, expect, it } from 'vitest'
import { AttendanceStatus } from '../matches/contracts/match.contract'
import { ScheduledJobType } from './contracts/notification.contract'
import { planMatchInviteJobs, shouldSendRsvpReminder } from './match-invite'

const inputNow = new Date('2026-09-01T18:00:00.000Z')

describe('planMatchInviteJobs', () => {
  it('schedules the invitation 5 days before kickoff and a later reminder', () => {
    const actual = planMatchInviteJobs({
      startsAt: new Date('2026-09-10T19:00:00.000Z'),
      now: inputNow,
      leadDays: 5,
      reminderLeadDays: 1,
      isNextMatch: true,
      inviteAlreadySent: false,
      reminderAlreadySent: false,
    })

    expect(actual).toEqual([
      {
        type: ScheduledJobType.MatchInvite,
        runAt: new Date('2026-09-05T19:00:00.000Z'),
        leadDays: 5,
      },
      {
        type: ScheduledJobType.RsvpReminder,
        runAt: new Date('2026-09-09T19:00:00.000Z'),
        leadDays: 1,
      },
    ])
  })

  it('does not schedule later matches until they are the next one', () => {
    const actual = planMatchInviteJobs({
      startsAt: new Date('2026-09-17T19:00:00.000Z'),
      now: inputNow,
      leadDays: 5,
      reminderLeadDays: 1,
      isNextMatch: false,
      inviteAlreadySent: false,
      reminderAlreadySent: false,
    })

    expect(actual).toEqual([])
  })

  it('does not schedule a reminder when none is configured', () => {
    const actual = planMatchInviteJobs({
      startsAt: new Date('2026-09-10T19:00:00.000Z'),
      now: inputNow,
      leadDays: 5,
      reminderLeadDays: null,
      isNextMatch: true,
      inviteAlreadySent: false,
      reminderAlreadySent: false,
    })

    expect(actual.map((job) => job.type)).toEqual([ScheduledJobType.MatchInvite])
  })

  it('sends only the next match immediately when its slot has already passed', () => {
    const actual = planMatchInviteJobs({
      startsAt: new Date('2026-09-03T19:00:00.000Z'),
      now: inputNow,
      leadDays: 5,
      reminderLeadDays: 1,
      isNextMatch: true,
      inviteAlreadySent: false,
      reminderAlreadySent: false,
    })

    expect(actual).toEqual([
      {
        type: ScheduledJobType.MatchInvite,
        runAt: inputNow,
        leadDays: 5,
      },
      {
        type: ScheduledJobType.RsvpReminder,
        runAt: new Date('2026-09-02T19:00:00.000Z'),
        leadDays: 1,
      },
    ])
  })

  it('does not schedule another invitation after one was already sent', () => {
    const actual = planMatchInviteJobs({
      startsAt: new Date('2026-09-10T19:00:00.000Z'),
      now: inputNow,
      leadDays: 7,
      reminderLeadDays: 1,
      isNextMatch: true,
      inviteAlreadySent: true,
      reminderAlreadySent: false,
    })

    expect(actual.map((job) => job.type)).toEqual([ScheduledJobType.RsvpReminder])
  })

  it('ignores a reminder that is not closer than the invitation', () => {
    const actual = planMatchInviteJobs({
      startsAt: new Date('2026-09-10T19:00:00.000Z'),
      now: inputNow,
      leadDays: 1,
      reminderLeadDays: 1,
      isNextMatch: true,
      inviteAlreadySent: false,
      reminderAlreadySent: false,
    })

    expect(actual.map((job) => job.type)).toEqual([ScheduledJobType.MatchInvite])
  })
})

describe('shouldSendRsvpReminder', () => {
  it('includes players who have not answered', () => {
    expect(shouldSendRsvpReminder(undefined)).toBe(true)
    expect(shouldSendRsvpReminder(AttendanceStatus.Pending)).toBe(true)
  })

  it('skips players who already answered', () => {
    expect(shouldSendRsvpReminder(AttendanceStatus.Present)).toBe(false)
    expect(shouldSendRsvpReminder(AttendanceStatus.Absent)).toBe(false)
  })
})
