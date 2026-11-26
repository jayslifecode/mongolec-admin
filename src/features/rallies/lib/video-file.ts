export const VIDEO_MIME_TYPE = 'video/mp4'
export const MAX_VIDEO_MB = 20
export const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024
export const MAX_VIDEO_SECONDS = 30

export interface VideoFileInfo {
  type: string
  size: number
  durationSeconds: number
}

/** A human message when the clip breaks a rule, or null when it is fine. */
export function videoFileError({ type, size, durationSeconds }: VideoFileInfo): string | null {
  if (type !== VIDEO_MIME_TYPE) return 'Use an MP4 video.'
  if (size > MAX_VIDEO_BYTES) {
    return `The video is ${Math.round(size / (1024 * 1024))} MB; the limit is ${MAX_VIDEO_MB} MB.`
  }
  if (!Number.isFinite(durationSeconds)) return 'This video could not be read. Try another MP4.'
  if (durationSeconds > MAX_VIDEO_SECONDS) {
    return `The video is ${Math.round(durationSeconds)} seconds; keep it to ${MAX_VIDEO_SECONDS} seconds or less.`
  }
  return null
}

/** Reads a video's length in seconds through a detached element. Rejects if the browser cannot decode it. */
export function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    const cleanup = () => {
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
    }
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      const seconds = video.duration
      cleanup()
      resolve(seconds)
    }
    video.onerror = () => {
      cleanup()
      reject(new Error('Video metadata could not be read'))
    }
    video.src = url
  })
}
