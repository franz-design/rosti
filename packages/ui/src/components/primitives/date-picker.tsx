import { CalendarIcon } from '@rosti/ui/icons'
import * as React from 'react'
import { type Locale } from 'react-day-picker'
import { fr } from 'react-day-picker/locale'
import { cn } from '@rosti/ui/lib/utils'
import { Calendar } from './calendar'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './input-group'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

function formatDate(date: Date, localeCode?: string): string {
  return date.toLocaleDateString(localeCode ?? 'fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function parseDate(input: string): Date | undefined {
  const parsed = new Date(input)
  if (!Number.isNaN(parsed.getTime())) return parsed

  const parts = input.split('/')
  if (parts.length === 3) {
    const [a, b, year] = parts
    const dayFirst = new Date(`${year}-${b?.padStart(2, '0')}-${a?.padStart(2, '0')}`)
    if (!Number.isNaN(dayFirst.getTime())) return dayFirst
    const monthFirst = new Date(`${year}-${a?.padStart(2, '0')}-${b?.padStart(2, '0')}`)
    if (!Number.isNaN(monthFirst.getTime())) return monthFirst
  }

  return undefined
}

const DEFAULT_YEARS_BACK = 10
const DEFAULT_YEARS_AHEAD = 10

interface DatePickerProps {
  initialDate?: Date
  value?: Date
  onDateChange?: (date: Date | undefined) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  locale?: Locale
  localeCode?: string
  /** Earliest selectable month. Defaults to 10 years before today. */
  startMonth?: Date
  /** Latest selectable month. Defaults to 10 years after today. */
  endMonth?: Date
}

export function DatePicker({
  initialDate,
  value,
  onDateChange,
  className,
  placeholder,
  disabled,
  locale,
  localeCode = 'fr-FR',
  startMonth,
  endMonth,
}: DatePickerProps) {
  const resolvedLocale = locale ?? (localeCode.startsWith('fr') ? fr : undefined)
  const [open, setOpen] = React.useState(false)
  const controlled = value !== undefined
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(initialDate)
  const date = controlled ? value : internalDate
  const [month, setMonth] = React.useState<Date | undefined>(date ?? initialDate)
  const [inputValue, setInputValue] = React.useState(date ? formatDate(date, localeCode) : '')

  const selectedYear = date?.getFullYear()
  const navRange = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    const firstYear = startMonth?.getFullYear() ?? currentYear - DEFAULT_YEARS_BACK
    const lastYear = endMonth?.getFullYear() ?? currentYear + DEFAULT_YEARS_AHEAD
    return {
      start: startMonth ?? new Date(Math.min(firstYear, selectedYear ?? firstYear), 0, 1),
      end: endMonth ?? new Date(Math.max(lastYear, selectedYear ?? lastYear), 11, 31),
    }
  }, [startMonth, endMonth, selectedYear])

  React.useEffect(() => {
    if (controlled) {
      setInputValue(value ? formatDate(value, localeCode) : '')
      if (value) setMonth(value)
    }
  }, [controlled, value, localeCode])

  const handleDateChange = (next: Date | undefined) => {
    if (!controlled) setInternalDate(next)
    setInputValue(next ? formatDate(next, localeCode) : '')
    onDateChange?.(next)
  }

  const handleInputBlur = () => {
    if (date) {
      setInputValue(formatDate(date, localeCode))
    } else {
      setInputValue('')
    }
  }

  return (
    <InputGroup className={cn('w-full h-full min-h-10', className)}>
      <InputGroupInput
        value={inputValue}
        placeholder={placeholder ?? 'Choisir une date'}
        disabled={disabled}
        onChange={(e) => {
          const parsed = parseDate(e.target.value)
          setInputValue(e.target.value)
          if (parsed) {
            if (!controlled) setInternalDate(parsed)
            setMonth(parsed)
            onDateChange?.(parsed)
          }
        }}
        onBlur={handleInputBlur}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          } else if (e.key === 'Enter') {
            e.preventDefault()
            handleDateChange(date)
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                aria-label="Ouvrir le calendrier"
                disabled={disabled}
              />
            }
          >
            <CalendarIcon />
            <span className="sr-only">Choisir une date</span>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            sideOffset={8}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              startMonth={navRange.start}
              endMonth={navRange.end}
              captionLayout="dropdown"
              locale={resolvedLocale}
              onSelect={(selected) => {
                handleDateChange(selected)
                setOpen(false)
              }}
              className="w-full"
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  )
}
