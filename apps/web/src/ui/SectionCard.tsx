import { useId, type ComponentProps, type ReactNode } from 'react'
import { Card } from './Card'
import { Label } from './Label'

/**
 * A Card with a visible heading, wired up with aria-labelledby.
 * `heading` 'label' is the small uppercase caption; 'title' is an h2 in the display font.
 */
export function SectionCard({
  title,
  headingStyle = 'label',
  children,
  ...props
}: Omit<ComponentProps<typeof Card>, 'title' | 'aria-labelledby'> & {
  title: ReactNode
  headingStyle?: 'label' | 'title'
}) {
  const id = useId()
  return (
    <Card aria-labelledby={id} {...props}>
      {headingStyle === 'title' ? (
        <h2 id={id} className="font-display text-base font-semibold">
          {title}
        </h2>
      ) : (
        <Label id={id}>{title}</Label>
      )}
      {children}
    </Card>
  )
}
