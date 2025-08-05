import { getHighlighter } from 'shiki'

let highlighter: Awaited<ReturnType<typeof getHighlighter>> | null = null

export async function highlightCode(code: string, lang = 'terraform') {
  if (!highlighter) {
    highlighter = await getHighlighter({
      themes: ['nord'], // or 'github-dark', 'material-theme', etc.
      langs: ['terraform']
    })
  }

  return highlighter.codeToHtml(code, { lang, theme: 'nord' })
}