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

  // TODO: Fetch article data and pass as initialValues to form

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <NewsArticleFormBlockNote mode='edit' articleId={id} />
    </div>
  )
}
