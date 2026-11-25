import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * The backend has no password reset flow yet, so this does not pretend to send an email.
 * It tells the person what to do instead.
 */
export function ForgotPasswordNotice() {
  return (
    <div className='grid gap-4'>
      <p className='text-sm'>
        Ask an administrator to reset your password. Once they have, you can sign in with the new one.
      </p>
      <Button asChild variant='outline'>
        <Link href='/sign-in'>
          <ArrowLeft aria-hidden='true' />
          Back to sign in
        </Link>
      </Button>
    </div>
  )
}
