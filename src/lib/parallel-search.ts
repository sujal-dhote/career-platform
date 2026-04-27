// Parallel AI Web Search — for live job and internship results

interface SearchResult {
  title: string
  url: string
  snippet: string
}

interface ParallelSearchResponse {
  results?: Array<{
    title?: string
    url?: string
    snippet?: string
    content?: string
  }>
  data?: Array<{
    title?: string
    url?: string
    snippet?: string
  }>
}

export async function searchJobs(query: string, objective: string): Promise<string> {
  const apiKey = process.env.PARALLEL_AI_KEY
  if (!apiKey) return ''

  try {
    const response = await fetch('https://api.parallel.ai/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        search_queries: [query],
        mode: 'advanced',
        advanced_settings: { max_results: 8 },
        objective,
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    if (!response.ok) {
      console.error('Parallel AI search failed:', response.status)
      return ''
    }

    const data: ParallelSearchResponse = await response.json()
    const results = data.results || data.data || []

    if (!results.length) return ''

    // Format results as markdown links
    const formatted = results
      .filter(r => r.url && r.title)
      .slice(0, 6)
      .map((r, i) => `${i + 1}. **[${r.title}](${r.url})**\n   ${r.snippet || ''}`)
      .join('\n\n')

    return formatted
  } catch (e) {
    console.error('Parallel AI search error:', e)
    return ''
  }
}

// Extract job role and location from user message
export function extractJobQuery(message: string): { query: string; objective: string } {
  const msg = message.toLowerCase()

  // Detect if internship or job
  const isInternship = /internship|intern|training/i.test(msg)

  // Extract tech keywords
  const techKeywords = [
    'python', 'java', 'javascript', 'react', 'node', 'angular', 'vue',
    'dotnet', '.net', 'php', 'android', 'ios', 'flutter', 'data science',
    'machine learning', 'ai', 'devops', 'cloud', 'aws', 'full stack',
    'frontend', 'backend', 'sql', 'database', 'cybersecurity', 'ui ux',
    'graphic design', 'digital marketing', 'seo', 'content writer'
  ]

  const foundTech = techKeywords.filter(t => msg.includes(t))

  // Extract location
  const locations = ['india', 'nagpur', 'pune', 'mumbai', 'bangalore', 'hyderabad', 'delhi', 'remote']
  const foundLocation = locations.find(l => msg.includes(l)) || 'India'

  const role = foundTech.length > 0 ? foundTech.join(' ') : 'software developer'
  const type = isInternship ? 'internship' : 'job'

  const query = `${role} ${type} ${foundLocation} 2025 apply online`
  const objective = `Find latest ${role} ${type} openings in ${foundLocation} with direct apply links from LinkedIn, Naukri, Indeed, Internshala`

  return { query, objective }
}
