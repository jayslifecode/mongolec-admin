import { Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PageHeader } from '@/components/admin'

export function NewsHeader() {
  return (
    <PageHeader
      title='News'
      description='Manage articles, categories, and publications'
      actions={
        <div className='flex gap-2'>
          <Button variant='outline' asChild size='sm'>
            <Link href='/news/categories'>
              <Settings className='mr-1.5 h-4 w-4' aria-hidden='true' />
              Categories
            </Link>
          </Button>
          <Button asChild size='sm'>
            <Link href='/news/create'>
              <Plus className='mr-1.5 h-4 w-4' aria-hidden='true' />
              New Article
            </Link>
          </Button>
        </div>
      }
    />
  )
}
