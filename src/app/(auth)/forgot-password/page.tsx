import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '@/features/auth/auth-layout'
import { ForgotPasswordNotice } from '@/features/auth/components/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Forgot Password
          </CardTitle>
          <CardDescription>
            Password reset is handled by your administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordNotice />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground mx-auto px-8 text-center text-sm text-balance'>
            Don&apos;t have an account?{' '}
            <Link
              href='/sign-up'
              className='hover:text-primary underline underline-offset-4'
            >
              Sign up
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
