export function toDate(datetime: string) {
  const [datePart, timePart] = datetime.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  const date = new Date(year, month - 1, day, hour, minute)

  return date
}
