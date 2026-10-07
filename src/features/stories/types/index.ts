export type LocalizedText = { en: string; mn: string } | string

export interface RallyRef {
  id: string
  slug: string
  title: LocalizedText
}

export type StoryType =
  | 'IMPACT'
  | 'TESTIMONIAL'
  | 'RANGER_PROFILE'
  | 'RIDER_PROFILE'
  | 'FIELD_MOMENT'
  | 'BEFORE_AFTER'
  | 'UPDATE'
  | 'NEWS'

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'

export interface ImpactSummary {
  riders?: number
  kilometers?: number
  bikes?: number
}

export interface GalleryImage {
  src: string
  caption?: string
}

export interface ChapterItem {
  title: string
  subtitle?: string
  body: string
  image?: string
}

export interface StatItem {
  value: string
  label: string
}

export interface HeroBlock {
  type: 'hero'
  title: string
  subtitle?: string
  image: string
  video?: string
}

export interface StatementBlock {
  type: 'statement'
  eyebrow?: string
  text: string
}

export interface TextBlock {
  type: 'text'
  heading?: string
  body: string
}

export interface ImageBlock {
  type: 'image'
  src: string
  caption?: string
  parallax?: boolean
}

export type GalleryLayout = 'masonry' | 'horizontal' | 'fullscreen'

export interface GalleryBlock {
  type: 'gallery'
  images: GalleryImage[]
  layout: GalleryLayout
}

export interface QuoteBlock {
  type: 'quote'
  text: string
  author?: string
  meta?: string
}

export interface ChaptersBlock {
  type: 'chapters'
  items: ChapterItem[]
}

export interface StatsBlock {
  type: 'stats'
  items: StatItem[]
}

export interface VideoBlock {
  type: 'video'
  src: string
  poster?: string
}

export interface ClosingCta {
  label: string
  href: string
}

export interface ClosingBlock {
  type: 'closing'
  title: string
  subtitle?: string
  image?: string
  cta?: ClosingCta
}

export type StoryBlock =
  | HeroBlock
  | StatementBlock
  | TextBlock
  | ImageBlock
  | GalleryBlock
  | QuoteBlock
  | ChaptersBlock
  | StatsBlock
  | VideoBlock
  | ClosingBlock

export type StoryBlockType = StoryBlock['type']

export interface StoryContent {
  version: number
  blocks: StoryBlock[]
}

export interface Story {
  id: string
  rally?: RallyRef | null
  title: LocalizedText
  slug: string
  excerpt?: LocalizedText | null
  content: StoryContent
  type: StoryType
  author?: LocalizedText | null
  role?: string | null
  featuredImage?: string | null
  gallery?: unknown
  videoUrl?: string | null
  impactSummary?: ImpactSummary | null
  status: ContentStatus
  publishedAt?: string | null
  featured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export const storyTypeConfig: Record<StoryType, { label: string }> = {
  IMPACT: { label: 'Impact' },
  TESTIMONIAL: { label: 'Testimonial' },
  RANGER_PROFILE: { label: 'Ranger Profile' },
  RIDER_PROFILE: { label: 'Rider Profile' },
  FIELD_MOMENT: { label: 'Field Moment' },
  BEFORE_AFTER: { label: 'Before / After' },
  UPDATE: { label: 'Update' },
  NEWS: { label: 'News' },
}

export const storyStatusConfig = {
  DRAFT: {
    label: 'Draft',
    variant: 'outline' as const,
  },
  PUBLISHED: {
    label: 'Published',
    variant: 'default' as const,
  },
  ARCHIVED: {
    label: 'Archived',
    variant: 'secondary' as const,
  },
  SCHEDULED: {
    label: 'Scheduled',
    variant: 'secondary' as const,
  },
} as const

export const BLOCK_TYPE_LABELS: Record<StoryBlockType, string> = {
  hero: 'Hero',
  statement: 'Statement',
  text: 'Text',
  image: 'Image',
  gallery: 'Gallery',
  quote: 'Quote',
  chapters: 'Chapters',
  stats: 'Stats',
  video: 'Video',
  closing: 'Closing',
}

export const BLOCK_TYPES: StoryBlockType[] = [
  'hero',
  'statement',
  'text',
  'image',
  'gallery',
  'quote',
  'chapters',
  'stats',
  'video',
  'closing',
]
