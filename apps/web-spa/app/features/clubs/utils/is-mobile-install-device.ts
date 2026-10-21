import { isIosDevice, type IosDeviceInput } from './is-ios-device'

export function isAndroidDevice(userAgent: string): boolean {
  return /Android/i.test(userAgent)
}

export function isMobileInstallDevice(input: IosDeviceInput): boolean {
  return isIosDevice(input) || isAndroidDevice(input.userAgent)
}
