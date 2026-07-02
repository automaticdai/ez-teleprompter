import { describe, it, expect } from 'vitest'
import { parseSrt, stripMarkdown, fileToText } from '../src/renderer/src/engine/srt.js'

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

describe('stripMarkdown', () => {
  it('strips headers, lists, emphasis and links to plain prose', () => {
    const md = [
      '# 开场',
      '',
      '大家好，欢迎收看 **本期节目**。',
      '',
      '- 第一点：*要点内容*',
      '- 第二点：[官网](https://example.com)链接',
      '',
      '> 引用一句话',
      '',
      '1. 有序项',
      '---'
    ].join('\n')

    expect(stripMarkdown(md)).toBe(
      ['开场', '', '大家好，欢迎收看 本期节目。', '', '第一点：要点内容', '第二点：官网链接', '', '引用一句话', '', '有序项'].join(
        '\n'
      )
    )
  })

  it('keeps images as alt text and inline code as text', () => {
    expect(stripMarkdown('看这张图 ![示意图](img.png) 和 `code` 片段')).toBe('看这张图 示意图 和 code 片段')
  })

  it('leaves single underscores in words alone', () => {
    expect(stripMarkdown('file_name_here stays')).toBe('file_name_here stays')
  })

  it('drops code fences but keeps the code between them', () => {
    expect(stripMarkdown('```js\nconst a = 1\n```')).toBe('const a = 1')
  })
})

describe('fileToText', () => {
  it('parses .srt by extension', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nHi'
    expect(fileToText('subs.srt', srt)).toBe('Hi')
  })

  it('strips markdown for .md/.markdown by extension', () => {
    expect(fileToText('script.md', '# Title\ntext')).toBe('Title\ntext')
    expect(fileToText('script.markdown', '**bold**')).toBe('bold')
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
