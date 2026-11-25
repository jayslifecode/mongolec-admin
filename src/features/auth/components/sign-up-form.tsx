'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@apollo/client/react'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PasswordInput } from '@/components/password-input'
import { REGISTER } from '@/graphql/mutations/auth'
import { GET_TENANTS } from '@/graphql/queries/tenant'

interface RegisterData {
  register: {
    success: boolean
    message?: string
    user: {
      id: string
      firstName: string
      lastName: string
      email: string
      isActive: boolean
      createdAt: string
      updatedAt: string
    }
  }
}

interface GetTenantsData {
  tenants: Array<{
    id: string
    name: string
    slug: string
  }>
}

const formSchema = z
  .object({
    firstName: z.string().min(1, 'Please enter your first name'),
    lastName: z.string().min(1, 'Please enter your last name'),
    email: z.email({
      error: (iss) =>
        iss.input === '' ? 'Please enter your email' : undefined,
    }),
    tenantSlug: z.string().min(1, 'Please select an organization'),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(7, 'Password must be at least 7 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {}

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useAuthStore()

  const { data: tenantsData, loading: tenantsLoading } = useQuery<GetTenantsData>(GET_TENANTS)
  const [registerMutation] = useMutation<RegisterData>(REGISTER)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      tenantSlug: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { data: registerData } = await registerMutation({
        variables: {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          tenantSlug: data.tenantSlug,
        },
      })

      if (registerData?.register?.success) {
        // Set user in the store (no token needed - using httpOnly cookies)
        setUser(registerData.register.user)

        // Show success message
        toast.success(
          registerData.register.message ||
          `Welcome, ${registerData.register.user.firstName}! Account created successfully.`
        )

        // Redirect to dashboard
        router.push('/')
      } else {
        // Handle registration failure
        toast.error(registerData?.register?.message || 'Registration failed')
      }
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input autoComplete='given-name' placeholder='John' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input autoComplete='family-name' placeholder='Doe' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type='email' autoComplete='email' placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='tenantSlug'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select your organization' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tenantsLoading ? (
                    <SelectItem value='loading' disabled>
                      Loading organizations...
                    </SelectItem>
                  ) : (
                    tenantsData?.tenants?.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.slug}>
                        {tenant.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete='new-password' placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete='new-password' placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <UserPlus />}
          Create Account
        </Button>
      </form>
    </Form>
  )
}
