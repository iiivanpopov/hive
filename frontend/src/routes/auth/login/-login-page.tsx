import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'

import { useLoginPage } from './-use-login-page'

export function LoginPage() {
  const { loginForm } = useLoginPage()

  return (
    <Card className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-xs">
      <CardHeader>
        <CardTitle>
          Login
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={e => e.preventDefault()}>
          <FieldGroup>
            <loginForm.AppField name="identity">
              {field => <field.Input label="Email or Username" />}
            </loginForm.AppField>
            <loginForm.AppField name="password">
              {field => <field.Input label="Password" type="password" />}
            </loginForm.AppField>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          onClick={loginForm.handleSubmit}
          type="submit"
          className="w-full"
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}
