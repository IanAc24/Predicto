/** Monday of the week containing a 'YYYY-MM-DD' date, as 'YYYY-MM-DD'. */
export function mondayOf(date: string): string {
  const d = new Date(`${date}T00:00:00Z`)
  const offset = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}
