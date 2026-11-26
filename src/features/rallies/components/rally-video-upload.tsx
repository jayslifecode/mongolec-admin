'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Film, Loader2, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CREATE_PRESIGNED_UPLOAD_URL } from '@/graphql/mutations/merch'
import { fieldDescriptionId, fieldErrorId } from '@/lib/ui/field-props'
import { readVideoDuration, VIDEO_MIME_TYPE, videoFileError } from '../lib/video-file'

export const VIDEO_HELP_TEXT =
  'Short, silent clip (MP4, up to 30 seconds and 20 MB). It plays on the rally page and, if featured, at the top of the home page. The featured photo shows while it loads.'

interface RallyVideoUploadProps {
  id: string
  /** The saved video URL ("" when none). */
  value: string
  onChange: (url: string) => void
  /** Told when an upload starts and ends, so the form can stay disabled until the video is saved. */
  onUploadingChange?: (uploading: boolean) => void
  /** A validation message from the form (for example a malformed saved URL). */
  error?: string | null
  disabled?: boolean
}

interface PresignedData {
  createPresignedUploadUrl: { uploadUrl: string; fileUrl: string }
}

export function RallyVideoUpload({ id, value, onChange, onUploadingChange, error, disabled }: RallyVideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const labelId = useId()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [createPresignedUrl] = useMutation<PresignedData>(CREATE_PRESIGNED_UPLOAD_URL)

  useEffect(() => {
    onUploadingChange?.(uploading)
  }, [uploading, onUploadingChange])

  const shownError = uploadError ?? error ?? null
  const describedBy = [shownError ? fieldErrorId(id) : null, fieldDescriptionId(id)].filter(Boolean).join(' ')

  const upload = async (file: File): Promise<string> => {
    const { data } = await createPresignedUrl({ variables: { fileType: file.type } })
    if (!data) throw new Error('Could not start the upload. Try again.')
    const { uploadUrl, fileUrl } = data.createPresignedUploadUrl
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
    if (!response.ok) throw new Error(`Upload failed (status ${response.status}). Try again.`)
    return fileUrl
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError(null)
    setUploading(true)
    try {
      const durationSeconds =
        file.type === VIDEO_MIME_TYPE ? await readVideoDuration(file).catch(() => Number.NaN) : 0
      const problem = videoFileError({ type: file.type, size: file.size, durationSeconds })
      if (problem) {
        setUploadError(problem)
        return
      }
      onChange(await upload(file))
    } catch (err: unknown) {
      setUploadError(err instanceof Error && err.message ? err.message : 'The upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setUploadError(null)
    onChange('')
  }

  return (
    <div className="space-y-3">
      <Label id={labelId} htmlFor={id}>
        Featured video
      </Label>

      {value ? (
        <video
          src={value}
          controls
          muted
          playsInline
          preload="metadata"
          aria-labelledby={labelId}
          className="aspect-video w-full max-w-md rounded-lg border border-border bg-muted"
        />
      ) : (
        <div className="flex aspect-video w-full max-w-md items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
          ) : (
            <Film className="h-6 w-6" aria-hidden="true" />
          )}
        </div>
      )}

      {!disabled && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={VIDEO_MIME_TYPE}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Button
            id={id}
            type="button"
            variant="outline"
            size="sm"
            aria-invalid={shownError ? true : undefined}
            aria-describedby={describedBy}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="mr-1.5 h-4 w-4" aria-hidden="true" />
            )}
            {uploading ? 'Uploading…' : value ? 'Replace video' : 'Upload video'}
          </Button>
          {value && !uploading && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
              <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>
      )}

      {shownError && (
        <p id={fieldErrorId(id)} role="alert" className="text-sm text-destructive">
          {shownError}
        </p>
      )}
      <p id={fieldDescriptionId(id)} className="text-xs text-muted-foreground">
        {VIDEO_HELP_TEXT}
      </p>
    </div>
  )
}
