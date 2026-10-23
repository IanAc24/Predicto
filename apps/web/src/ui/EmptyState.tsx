import type { ReactNode } from 'react'
import { Card } from './Card'
import { Logo } from './shell/Logo'

/** Logo, a line of text and optional actions, for "nothing here yet". */
export function EmptyState({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-4 text-center">
      <Logo className="mt-1 size-[72px]! opacity-85" />
      <p className="text-[13px] leading-snug text-muted">{text}</p>
      {children}
    </Card>
  )
}
