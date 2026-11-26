import { describe, expect, test } from 'vitest'
import { MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, videoFileError } from './video-file'

const ok = { type: 'video/mp4', size: 5 * 1024 * 1024, durationSeconds: 12 }

describe('videoFileError', () => {
  test('accepts a short MP4 under the size limit', () => {
    expect(videoFileError(ok)).toBeNull()
  })

  test('accepts files exactly at the limits', () => {
    expect(videoFileError({ ...ok, size: MAX_VIDEO_BYTES, durationSeconds: MAX_VIDEO_SECONDS })).toBeNull()
  })

  test('rejects non-MP4 types', () => {
    expect(videoFileError({ ...ok, type: 'video/quicktime' })).toBe('Use an MP4 video.')
    expect(videoFileError({ ...ok, type: 'image/png' })).toBe('Use an MP4 video.')
  })

  test('rejects files over 20 MB and names the size', () => {
    expect(videoFileError({ ...ok, size: 34 * 1024 * 1024 })).toBe('The video is 34 MB; the limit is 20 MB.')
  })

  test('rejects videos longer than 30 seconds', () => {
    expect(videoFileError({ ...ok, durationSeconds: 45 })).toBe(
      'The video is 45 seconds; keep it to 30 seconds or less.'
    )
  })

  test('rejects an unreadable duration', () => {
    expect(videoFileError({ ...ok, durationSeconds: Number.NaN })).toBe('This video could not be read. Try another MP4.')
    expect(videoFileError({ ...ok, durationSeconds: Infinity })).toBe('This video could not be read. Try another MP4.')
  })

  test('checks type before size and size before duration', () => {
    expect(videoFileError({ type: 'video/webm', size: MAX_VIDEO_BYTES * 2, durationSeconds: 99 })).toBe('Use an MP4 video.')
    expect(videoFileError({ ...ok, size: MAX_VIDEO_BYTES + 1, durationSeconds: 99 })).toMatch(/limit is 20 MB/)
  })
})
