import RostiLogo from '@/assets/images/rosti-logo.svg'

export function AuthBrand() {
  return (
    <a href="/" className="flex items-center gap-1 self-start">
      <img src={RostiLogo} alt="" className="size-7 rounded-md object-contain" />
      <span className="font-logo text-2xl leading-none font-medium tracking-tight text-primary">
        Rösti
      </span>
    </a>
  )
}
