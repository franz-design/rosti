interface IosDeviceInput {
  userAgent: string
  platform: string
  maxTouchPoints: number
}

export function isIosDevice(input: IosDeviceInput): boolean {
  if (/iPad|iPhone|iPod/.test(input.userAgent)) return true
  return input.platform === 'MacIntel' && input.maxTouchPoints > 1
}
