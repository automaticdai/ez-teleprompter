// Convert imported file contents into plain teleprompter text.
// For .srt we strip sequence numbers and timecodes, keeping only spoken lines.

export function clampStr(s) {
  return typeof s === 'string' ? s : ''
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

// Decide how to interpret a file by name; .srt is parsed, everything else is raw.
export function fileToText(name, content) {
  return /\.srt$/i.test(name || '') ? parseSrt(content) : clampStr(content)
}
