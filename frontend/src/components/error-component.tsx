import { Typography } from './ui/typography'

export function ErrorComponent({ error }: {
  error: {
    code: string
    message: string
  }
}) {
  return (
    <div className="w-full flex justify-center items-center flex-col gap-4">
      <Typography variant="heading">
        {error.code}
      </Typography>
      <Typography variant="subheading">
        {error.message}
      </Typography>
    </div>
  )
}
