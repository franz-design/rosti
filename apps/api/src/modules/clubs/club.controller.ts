import { TypedBody, TypedController, TypedParam, TypedRoute } from '@lonestone/nzoth/server'
import {
  BadRequestException,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiConsumes } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { z } from 'zod'
import { LoggedInBetterAuthSession } from '../auth/auth.config'
import { Session } from '../auth/auth.decorator'
import { AuthGuard } from '../auth/auth.guard'
import { Organization } from '../auth/auth.entity'
import { OrganizationService } from '../auth/organization.service'
import { AvatarUploadExceptionFilter } from '../avatars/avatar-upload.filter'
import { AVATAR_MAX_BYTES } from '../avatars/avatar.constants'
import { AvatarService } from '../avatars/avatar.service'
import { AvatarDto, avatarSchema } from '../avatars/contracts/avatar.contract'
import { NotificationService } from '../notifications/notification.service'
import {
  ClubDto,
  clubMembersSchema,
  clubSchema,
  clubsSchema,
  UpdateClubInput,
  updateClubSchema,
  UpdateMemberRoleInput,
  updateMemberRoleSchema,
} from './contracts/club.contract'

function toClubDto(o: Organization): ClubDto {
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    logo: o.logo,
    paymentLink: o.paymentLink,
    venue: o.venue,
    sportType: o.sportType,
    defaultMaxCapacity: o.defaultMaxCapacity,
    matchInviteLeadDays: o.matchInviteLeadDays,
    matchInviteReminderLeadDays: o.matchInviteReminderLeadDays,
    createdAt: o.createdAt,
  }
}

interface UploadedAvatar {
  buffer: Buffer
  size: number
}

@TypedController('clubs', undefined, { tags: ['Clubs'] })
@UseGuards(AuthGuard)
export class ClubController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly notificationService: NotificationService,
    private readonly avatarService: AvatarService,
  ) {}

  @TypedRoute.Get('', clubsSchema)
  async listMine(@Session() session: LoggedInBetterAuthSession): Promise<ClubDto[]> {
    const orgs = await this.organizationService.getUserOrganizations(session.user.id)
    return orgs.map(toClubDto)
  }

  @TypedRoute.Get(':organizationId', clubSchema)
  async getOne(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
  ): Promise<ClubDto> {
    await this.organizationService.requireMember(organizationId, session.user.id)
    const o = await this.organizationService.getOrganizationById(organizationId)
    if (!o) throw new Error('Club not found')
    return toClubDto(o)
  }

  @TypedRoute.Patch(':organizationId', clubSchema)
  async update(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedBody(updateClubSchema) body: UpdateClubInput,
  ): Promise<ClubDto> {
    const o = await this.organizationService.updateOrganization(
      organizationId,
      session.user.id,
      body,
    )
    if (body.matchInviteLeadDays !== undefined || body.matchInviteReminderLeadDays !== undefined) {
      await this.notificationService.syncUpcomingMatchInvites(organizationId)
    }
    return toClubDto(o)
  }

  @TypedRoute.Get(':organizationId/members', clubMembersSchema)
  async listMembers(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
  ) {
    await this.organizationService.requireMember(organizationId, session.user.id)
    const members = await this.organizationService.listMembers(organizationId)
    return members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      phone: m.user.phone,
      image: m.user.image,
      role: m.role,
      createdAt: m.createdAt,
    }))
  }

  @TypedRoute.Patch(':organizationId/members/:memberId/role', clubMembersSchema.element)
  async updateRole(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('memberId', z.string().uuid()) memberId: string,
    @TypedBody(updateMemberRoleSchema) body: UpdateMemberRoleInput,
  ) {
    const m = await this.organizationService.updateMemberRole(memberId, body.role, session.user.id)
    return {
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      phone: m.user.phone,
      image: m.user.image,
      role: m.role,
      createdAt: m.createdAt,
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @TypedRoute.Put(':organizationId/members/:memberId/avatar', avatarSchema)
  @UseFilters(AvatarUploadExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
    }),
  )
  async uploadMemberAvatar(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('memberId', z.string().uuid()) memberId: string,
    @UploadedFile() file: UploadedAvatar | undefined,
  ): Promise<AvatarDto> {
    if (!file || file.size === 0) {
      throw new BadRequestException('Choose an image file')
    }
    const userId = await this.requireMemberUserId(organizationId, memberId, session.user.id)
    const user = await this.avatarService.save(userId, file.buffer)
    return { image: user.image }
  }

  @TypedRoute.Delete(':organizationId/members/:memberId/avatar', avatarSchema)
  async removeMemberAvatar(
    @Session() session: LoggedInBetterAuthSession,
    @TypedParam('organizationId', z.string().uuid()) organizationId: string,
    @TypedParam('memberId', z.string().uuid()) memberId: string,
  ): Promise<AvatarDto> {
    const userId = await this.requireMemberUserId(organizationId, memberId, session.user.id)
    const user = await this.avatarService.remove(userId)
    return { image: user.image }
  }

  private async requireMemberUserId(
    organizationId: string,
    memberId: string,
    actorUserId: string,
  ): Promise<string> {
    await this.organizationService.requireRole(organizationId, actorUserId, ['owner', 'admin'])
    const member = await this.organizationService.requireClubMember(organizationId, memberId)
    return member.user.id
  }
}
