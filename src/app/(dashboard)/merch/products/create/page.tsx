'use client'

import { useState } from 'react'
import { MerchProductForm } from '@/features/merch/components/merch-product-form'
import { PageHeader } from '@/components/admin'

export default function MerchProductCreatePage() {
  const [language, setLanguage] = useState<'en' | 'mn'>('en')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create Product"
        description="Add a new product to your merchandise store"
        backHref="/merch"
        lang={language}
        onLangChange={setLanguage}
      />
      <MerchProductForm language={language} onLanguageChange={setLanguage} />
    </div>
  )
}
