import { NotFoundException } from '@nestjs/common'
import { Member } from './auth.entity'
import { OrganizationService } from './organization.service'

describe('organizationService.requireClubMember', () => {
  const member = { id: 'member-id', user: { id: 'user-id' } }
  const em = { findOne: vi.fn() }
  const service = new OrganizationService(em as never)

  beforeEach(() => {
    em.findOne.mockReset()
  })

  it('returns the member when they belong to the club', async () => {
    em.findOne.mockResolvedValue(member)

    await expect(service.requireClubMember('org-id', 'member-id')).resolves.toBe(member)
    expect(em.findOne).toHaveBeenCalledWith(
      Member,
      { id: 'member-id', organization: { id: 'org-id' } },
      { populate: ['user', 'organization'] },
    )
  })

  it('rejects when the member is not in this club', async () => {
    em.findOne.mockResolvedValue(null)

    await expect(service.requireClubMember('org-id', 'member-id')).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })
})
