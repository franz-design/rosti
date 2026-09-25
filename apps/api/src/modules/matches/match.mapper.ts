import { Injectable } from '@nestjs/common'
import { MatchLineup } from './match-lineup.entity'
import { Match } from './match.entity'
import { MatchAttendance } from './match-attendance.entity'
import { AttendanceDto, LineupDto, MatchDto, TeamSide } from './contracts/match.contract'

interface MatchDtoExtras {
  presentCount?: number
  viewerTeam?: TeamSide
}

interface MatchListDtoExtras {
  presentCounts?: Map<string, number>
  viewerTeams?: Map<string, TeamSide>
}

@Injectable()
export class MatchMapper {
  toDto(match: Match, extras: MatchDtoExtras = {}): MatchDto {
    return {
      id: match.id,
      organizationId: match.organization.id,
      seasonId: match.season.id,
      seriesId: match.series?.id,
      title: match.title,
      startsAt: match.startsAt,
      location: match.location,
      maxCapacity: match.maxCapacity,
      status: match.status,
      blueScore: match.blueScore,
      redScore: match.redScore,
      reminderOffsetsHours: match.reminderOffsetsHours,
      presentCount: extras.presentCount,
      viewerTeam: extras.viewerTeam,
      cancellationReason: match.cancellationReason,
      createdAt: match.createdAt,
    }
  }

  toDtos(matches: Match[], extras: MatchListDtoExtras = {}): MatchDto[] {
    return matches.map((match) =>
      this.toDto(match, {
        presentCount: extras.presentCounts?.get(match.id),
        viewerTeam: extras.viewerTeams?.get(match.id),
      }),
    )
  }

  toAttendanceDto(a: MatchAttendance): AttendanceDto {
    return {
      id: a.id,
      matchId: a.match.id,
      userId: a.user.id,
      userName: a.user.name,
      image: a.user.image,
      status: a.status,
      respondedAt: a.respondedAt,
    }
  }

  toLineupDto(l: MatchLineup): LineupDto {
    return {
      id: l.id,
      matchId: l.match.id,
      userId: l.user.id,
      userName: l.user.name,
      image: l.user.image,
      team: l.team,
    }
  }
}
