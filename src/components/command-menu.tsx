'use client'

import { useEffect } from 'react'
import { useSearch } from '@/context/search-provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useRouter } from 'next/navigation'

export function CommandMenu() {
  const { open, setOpen } = useSearch()
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => router.push('/'))}>Dashboard</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/rallies'))}>Rallies</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/stories'))}>Stories</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/applications'))}>Applications</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/nominations'))}>Nominations</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/rangers'))}>Rangers</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/contact'))}>Contact</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/team'))}>Team</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/news'))}>News</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/merch'))}>Merchandise</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/tenants'))}>Tenants</CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/users'))}>Users</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
