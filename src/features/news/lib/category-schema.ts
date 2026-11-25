import { z } from 'zod'
import { categoryBaseSchema, hexColor } from '@/features/merch/lib/category-schema'

export const newsCategorySchema = categoryBaseSchema.extend({
  color: hexColor,
})

export type NewsCategoryFormData = z.infer<typeof newsCategorySchema>
