'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { BookOpen, Edit, MoreHorizontal, Send, Star, Trash2, Undo2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DataTable, createUpdatedAtColumn } from '@/components/data-table'
import type { LocalizedText, Story } from '../types'
import { storyStatusConfig, storyTypeConfig } from '../types'
import {
  DELETE_STORY,
  PUBLISH_STORY,
  TOGGLE_STORY_FEATURED,
  UNPUBLISH_STORY,
} from '@/graphql/mutations/stories'

function getDisplayText(field: LocalizedText | null | undefined): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}

function ActionsCell({
  story,
  onDeleteClick,
  onPublishToggle,
}: {
  story: Story
  onDeleteClick: (id: string) => void
  onPublishToggle: (story: Story) => void
}) {
  const isPublished = story.status === 'PUBLISHED'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/stories/${story.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPublishToggle(story)}>
          {isPublished ? (
            <>
              <Undo2 className="mr-2 h-4 w-4" />
              Unpublish
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDeleteClick(story.id)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(
  onDeleteClick: (id: string) => void,
  onPublishToggle: (story: Story) => void,
  onToggleFeatured: (id: string) => void
): ColumnDef<Story>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Story',
      cell: ({ row }) => {
        const story = row.original
        const title = getDisplayText(story.title)
        return (
          <div className="flex items-center gap-3">
            {story.featuredImage ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-muted flex-shrink-0">
                <Image
                  src={story.featuredImage}
                  alt={title || 'Story'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border flex-shrink-0">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate text-sm">
                {title || <span className="text-muted-foreground italic">Untitled Story</span>}
              </div>
              {story.slug && (
                <div className="text-xs text-muted-foreground font-mono">{story.slug}</div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'rally',
      header: 'Rally',
      cell: ({ row }) => {
        const rally = row.original.rally
        if (!rally) return <span className="text-muted-foreground text-sm">—</span>
        return <span className="text-sm">{getDisplayText(rally.title)}</span>
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {storyTypeConfig[row.original.type]?.label ?? row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        const config = storyStatusConfig[status]
        return <Badge variant={config?.variant ?? 'outline'}>{config?.label ?? status}</Badge>
      },
    },
    {
      accessorKey: 'featured',
      header: 'Featured',
      cell: ({ row }) => {
        const story = row.original
        return (
          <button
            type="button"
            onClick={() => onToggleFeatured(story.id)}
            className="inline-flex items-center gap-1 text-xs"
          >
            <Star
              className={`h-4 w-4 ${story.featured ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
            />
          </button>
        )
      },
    },
    createUpdatedAtColumn<Story>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsCell story={row.original} onDeleteClick={onDeleteClick} onPublishToggle={onPublishToggle} />
      ),
    },
  ]
}

interface StoriesTableProps {
  stories: Story[]
  loading?: boolean
}

export function StoriesTable({ stories, loading }: StoriesTableProps) {
  const router = useRouter()
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null)

  const [publishStory] = useMutation(PUBLISH_STORY, {
    onCompleted: () => {
      toast.success('Story published')
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  const [unpublishStory] = useMutation(UNPUBLISH_STORY, {
    onCompleted: () => {
      toast.success('Story unpublished')
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  const [toggleFeatured] = useMutation(TOGGLE_STORY_FEATURED, {
    onCompleted: () => {
      toast.success('Featured status updated')
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  const [deleteStory] = useMutation(DELETE_STORY, {
    onCompleted: () => {
      toast.success('Story deleted')
      setDeleteDialogId(null)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
      setDeleteDialogId(null)
    },
  })

  const handlePublishToggle = (story: Story) => {
    const mutation = story.status === 'PUBLISHED' ? unpublishStory : publishStory
    mutation({ variables: { id: story.id }, refetchQueries: ['GetStories'] })
  }

  const handleToggleFeatured = (id: string) => {
    toggleFeatured({ variables: { id }, refetchQueries: ['GetStories'] })
  }

  const handleDeleteClick = (id: string) => setDeleteDialogId(id)

  const confirmDelete = () => {
    if (deleteDialogId) {
      deleteStory({ variables: { id: deleteDialogId }, refetchQueries: ['GetStories'] })
    }
  }

  const columns = buildColumns(handleDeleteClick, handlePublishToggle, handleToggleFeatured)

  return (
    <>
      <DataTable
        data={stories}
        columns={columns}
        loading={loading}
        showIndexColumn={false}
        enableRowSelection
        emptyMessage="No stories found."
        toolbarConfig={{ searchPlaceholder: 'Search stories...' }}
      />

      <AlertDialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The story and all its content will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
