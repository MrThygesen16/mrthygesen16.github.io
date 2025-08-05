import { createHighlighter } from 'shiki'

let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null

export async function highlightCode(code: string, lang = 'terraform') {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['nord'], // or 'github-dark', 'material-theme', etc.
      langs: ['terraform']
    })
  }

  return highlighter.codeToHtml(code, { lang, theme: 'nord' })
}