import RostiLogo from '@/assets/images/rosti-logo.svg'

export function AuthBrand() {
  return (
    <div className="flex justify-center gap-2 md:justify-start">
      <a href="/" className="flex items-center gap-1">
        <img src={RostiLogo} alt="" className="size-7 rounded-md object-contain" />
        <span className="font-logo font-medium tracking-tight text-2xl text-primary">Rösti</span>
      </a>
    </div>
  )
}
