import type { ReactNode } from 'react'

/** One column on phones, two equal columns on desktop. Put two `Column`s inside. */
export function Columns({ children }: { children: ReactNode }) {
  return <div className="cols">{children}</div>
}

export function Column({ children }: { children: ReactNode }) {
  return <div className="col">{children}</div>
}
