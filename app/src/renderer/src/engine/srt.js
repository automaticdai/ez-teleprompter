// Convert imported file contents into plain teleprompter text.
// For .srt we strip sequence numbers and timecodes, keeping only spoken lines.
// For .md we strip markup so headers/links/emphasis read as spoken prose.

export function clampStr(s) {
  return typeof s === 'string' ? s : ''
}

// Conservative markdown-to-prose: remove the syntax people actually put in
// scripts (headers, lists, links, bold/italic, code) while never touching the
// words themselves. Single underscores are deliberately left alone so
// file_names_like_this survive.
export function stripMarkdown(raw) {
  return clampStr(raw)
    .replace(/\r/g, '')
    .replace(/^```.*$/gm, '') // code fences (keep the code between them)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images -> alt text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> link text
    .replace(/^#{1,6}\s+/gm, '') // headers
    .replace(/^>\s?/gm, '') // blockquotes
    .replace(/^[ \t]*([-*_])( *\1){2,}[ \t]*$/gm, '') // horizontal rules
    .replace(/^[ \t]*[-*+]\s+/gm, '') // bullet list markers
    .replace(/^[ \t]*\d+[.)]\s+/gm, '') // numbered list markers
    .replace(/(\*\*|__)(.+?)\1/g, '$2') // bold
    .replace(/\*(\S(?:.*?\S)?)\*/g, '$1') // *italic* (not single underscores)
    .replace(/~~(.+?)~~/g, '$1') // strikethrough
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\n{3,}/g, '\n\n') // collapse gaps left by removed lines
    .trim()
}

export function parseSrt(raw) {
  return clampStr(raw)
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split('\n')
        .filter((line) => !/^\d+$/.test(line.trim()) && !line.includes('-->'))
        .join('\n')
        .trim()
    )
    .filter((block) => block !== '')
    .join('\n\n')
}

// Decide how to interpret a file by name; .srt and .md are converted to plain
// prose, everything else is taken raw.
export function fileToText(name, content) {
  const n = name || ''
  if (/\.srt$/i.test(n)) return parseSrt(content)
  if (/\.(md|markdown)$/i.test(n)) return stripMarkdown(content)
  return clampStr(content)
}
