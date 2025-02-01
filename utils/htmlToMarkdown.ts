export function htmlToMarkdown(html: string): string {
  // Remove any script and style tags
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")

  // Convert <h1> (chapter titles) to Markdown
  html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")

  // Convert <p> to plain text with line breaks
  html = html.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")

  // Convert <br> to line breaks
  html = html.replace(/<br\s*\/?>/gi, "\n")

  // Convert <strong> or <b> to bold
  html = html.replace(/<(strong|b)>(.*?)<\/\1>/gi, "**$2**")

  // Convert <em> or <i> to italic
  html = html.replace(/<(em|i)>(.*?)<\/\1>/gi, "*$2*")

  // Convert <ul> and <ol> lists
  html = html.replace(/<ul>(.*?)<\/ul>/gis, (match, p1) => {
    return p1.replace(/<li>(.*?)<\/li>/gi, "- $1\n")
  })
  html = html.replace(/<ol>(.*?)<\/ol>/gis, (match, p1) => {
    let index = 1
    return p1.replace(/<li>(.*?)<\/li>/gi, () => `${index++}. $1\n`)
  })

  // Convert <hr> to Markdown horizontal rule
  html = html.replace(/<hr\s*\/?>/gi, "---\n\n")

  // Remove any remaining HTML tags
  html = html.replace(/<[^>]+>/g, "")

  // Decode HTML entities
  html = html
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  // Ensure proper spacing between paragraphs
  html = html.replace(/\n{3,}/g, "\n\n")

  // Trim extra whitespace
  html = html.trim()

  return html
}

