import { describe, it, expect } from 'vitest'
import { parseSrt, fileToText } from '../src/renderer/src/engine/srt.js'

describe('parseSrt', () => {
  it('strips sequence numbers and timecodes, keeping spoken lines', () => {
    const srt = [
      '1',
      '00:00:01,000 --> 00:00:03,000',
      'Hello world',
      '',
      '2',
      '00:00:04,000 --> 00:00:06,000',
      'Second line',
      'still second'
    ].join('\n')

    expect(parseSrt(srt)).toBe('Hello world\n\nSecond line\nstill second')
  })

  it('handles CRLF line endings', () => {
    const srt = '1\r\n00:00:01,000 --> 00:00:02,000\r\nHi there\r\n'
    expect(parseSrt(srt)).toBe('Hi there')
  })

  it('returns empty string for empty input', () => {
    expect(parseSrt('')).toBe('')
    expect(parseSrt(undefined)).toBe('')
  })
})

describe('fileToText', () => {
  it('parses .srt by extension', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nHi'
    expect(fileToText('subs.srt', srt)).toBe('Hi')
  })

  it('passes through non-srt files unchanged', () => {
    const txt = 'line one\nline two'
    expect(fileToText('script.txt', txt)).toBe(txt)
  })

  it('is case-insensitive on the extension', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nHi'
    expect(fileToText('SUBS.SRT', srt)).toBe('Hi')
  })
})
