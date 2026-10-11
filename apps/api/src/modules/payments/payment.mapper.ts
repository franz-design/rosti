import { SessionFeeDto } from './contracts/payment.contract'
import { buildPaymentUrl } from './payment-link'
import { SessionFee } from './session-fee.entity'

export function toSessionFeeDto(fee: SessionFee, paymentLink?: string | null): SessionFeeDto {
  return {
    id: fee.id,
    matchId: fee.match.id,
    userId: fee.user.id,
    userName: fee.user.name,
    amountCents: fee.amountCents,
    shares: fee.shares,
    status: fee.status,
    paidAt: fee.paidAt ?? null,
    reminderCount: fee.reminderCount,
    lastRemindedAt: fee.lastRemindedAt ?? null,
    paymentUrl: buildPaymentUrl(paymentLink, fee.amountCents) ?? null,
  }
}
