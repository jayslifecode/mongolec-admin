import { Metadata } from 'next'
import { NewsArticleFormBlockNote } from '@/features/news/components/news-article-form-blocknote'

export const metadata: Metadata = {
  title: 'Edit News Article',
  description: 'Edit news article content and settings',
}

interface EditNewsPageProps {
  params: Promise<{ id: string }>
}

export default async function EditNewsPage({ params }: EditNewsPageProps) {
  const { id } = await params

  return (
    <div className='mx-auto max-w-6xl'>
      <NewsArticleFormBlockNote mode='edit' articleId={id} />
    </div>
  )
}
