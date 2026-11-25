import { Metadata } from 'next'
import { NewsArticleFormBlockNote } from '@/features/news/components/news-article-form-blocknote'

export const metadata: Metadata = {
  title: 'Create News Article',
  description: 'Create a new news article with rich content blocks',
}

export default function NewsCreatePage() {
  return (
    <div className='mx-auto max-w-6xl'>
      <NewsArticleFormBlockNote mode='create' />
    </div>
  )
}
