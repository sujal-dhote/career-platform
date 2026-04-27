// Parallel AI — fetch actual job listings with direct apply links

interface JobResult {
  title: string
  url: string
  company?: string
  location?: string
  snippet?: string
}

export async function fetchJobListings(message: string, agentType: string): Promise<JobResult[]> {
  const apiKey = process.env.PARALLEL_AI_KEY
  if (!apiKey) return []

  const isInternship = agentType === 'internship' || /internship|intern/i.test(message)

  // Build targeted search queries for actual job listings
  const queries = buildSearchQueries(message, isInternship)

  try {
    const response = await fetch('https://api.parallel.ai/v1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        search_queries: queries,
        mode: 'advanced',
        advanced_settings: { max_results: 10 },
        objective: `Find actual ${isInternship ? 'internship' : 'job'} listings with direct apply links. Focus on LinkedIn jobs, Naukri listings, Indeed job posts, Internshala listings. Return only actual job postings not search pages.`
      }),
      signal: AbortSignal.timeout(12000),
    })

    if (!response.ok) return []

    const data = await response.json()
    const results = data.results || []

    // Filter to only actual job listing pages
    const jobResults: JobResult[] = results
      .filter((r: any) => {
        const url = r.url || ''
        const title = r.title || ''
        // Keep only actual job listing URLs
        return (
          url.includes('linkedin.com/jobs/view') ||
          url.includes('naukri.com/job-listings') ||
          url.includes('indeed.com/viewjob') ||
          url.includes('internshala.com/internship/detail') ||
          url.includes('glassdoor.com/job-listing') ||
          url.includes('unstop.com/internships/') ||
          url.includes('wellfound.com/jobs/') ||
          url.includes('shine.com/job-search/') ||
          // Also keep if title looks like a job posting
          /hiring|apply|opening|vacancy|position|role|engineer|developer|analyst|designer|manager/i.test(title)
        )
      })
      .slice(0, 6)
      .map((r: any) => ({
        title: r.title || 'Job Opening',
        url: r.url,
        snippet: Array.isArray(r.excerpts) ? r.excerpts[0] : (r.snippet || ''),
        company: extractCompany(r.title || '', r.url || ''),
        location: extractLocation(r.title || '', r.excerpts || [])
      }))

    return jobResults
  } catch (e) {
    console.error('Parallel AI fetch error:', e)
    return []
  }
}

function buildSearchQueries(message: string, isInternship: boolean): string[] {
  const msg = message.toLowerCase()
  const type = isInternship ? 'internship' : 'job'

  // Extract role — more specific matching
  const roleMap: Record<string, string> = {
    'frontend developer': 'frontend developer',
    'front end developer': 'frontend developer',
    'front-end developer': 'frontend developer',
    'frontend engineer': 'frontend engineer',
    'backend developer': 'backend developer',
    'back end developer': 'backend developer',
    'full stack developer': 'full stack developer',
    'fullstack developer': 'full stack developer',
    'react developer': 'react developer',
    'react.js developer': 'react developer',
    'reactjs developer': 'react developer',
    'node.js developer': 'node.js developer',
    'nodejs developer': 'node.js developer',
    'angular developer': 'angular developer',
    'vue developer': 'vue.js developer',
    'python developer': 'python developer',
    'java developer': 'java developer',
    '.net developer': '.net developer',
    'dotnet developer': '.net developer',
    'php developer': 'php developer',
    'android developer': 'android developer',
    'flutter developer': 'flutter developer',
    'ios developer': 'ios developer',
    'data scientist': 'data scientist',
    'data analyst': 'data analyst',
    'machine learning engineer': 'machine learning engineer',
    'ml engineer': 'machine learning engineer',
    'ai engineer': 'ai engineer',
    'devops engineer': 'devops engineer',
    'cloud engineer': 'cloud engineer',
    'aws engineer': 'aws engineer',
    'ui ux designer': 'ui ux designer',
    'ui/ux designer': 'ui ux designer',
    'graphic designer': 'graphic designer',
    'digital marketing': 'digital marketing executive',
    'seo specialist': 'seo specialist',
    'content writer': 'content writer',
    'business analyst': 'business analyst',
    'software engineer': 'software engineer',
    'web developer': 'web developer',
    'mobile developer': 'mobile developer',
    'cybersecurity': 'cybersecurity analyst',
  }

  // Find best matching role
  let role = ''
  for (const [key, val] of Object.entries(roleMap)) {
    if (msg.includes(key)) { role = val; break }
  }

  // Single keyword fallback
  if (!role) {
    const singleMap: Record<string, string> = {
      'frontend': 'frontend developer',
      'front end': 'frontend developer',
      'backend': 'backend developer',
      'back end': 'backend developer',
      'fullstack': 'full stack developer',
      'react': 'react developer',
      'angular': 'angular developer',
      'vue': 'vue.js developer',
      'node': 'node.js developer',
      'python': 'python developer',
      'java': 'java developer',
      '.net': '.net developer',
      'php': 'php developer',
      'android': 'android developer',
      'flutter': 'flutter developer',
      'ios': 'ios developer',
      'data science': 'data scientist',
      'machine learning': 'machine learning engineer',
      'devops': 'devops engineer',
      'aws': 'aws cloud engineer',
      'ui ux': 'ui ux designer',
      'graphic': 'graphic designer',
      'marketing': 'digital marketing executive',
      'seo': 'seo specialist',
      'content': 'content writer',
    }
    for (const [key, val] of Object.entries(singleMap)) {
      if (msg.includes(key)) { role = val; break }
    }
  }

  if (!role) role = isInternship ? 'software intern' : 'software developer'

  const cities = ['nagpur', 'pune', 'mumbai', 'bangalore', 'hyderabad', 'delhi', 'noida', 'chennai', 'remote']
  const city = cities.find(c => msg.includes(c)) || 'India'

  const roleQuoted = `"${role}"`

  return [
    `site:linkedin.com/jobs ${roleQuoted} ${city} ${type} 2025`,
    `site:naukri.com ${roleQuoted} ${city} hiring 2025`,
    isInternship
      ? `site:internshala.com ${roleQuoted} internship ${city} 2025`
      : `site:indeed.com ${roleQuoted} ${city} apply 2025`,
  ]
}

function extractCompany(title: string, url: string): string {
  // Try to extract company from title like "Software Engineer at Google"
  const atMatch = title.match(/at\s+([A-Z][a-zA-Z\s]+?)(?:\s*[-|]|$)/i)
  if (atMatch) return atMatch[1].trim()

  // From URL domain
  const domainMatch = url.match(/(?:www\.)?([a-zA-Z0-9-]+)\.(com|in|io|co)/)
  if (domainMatch && !['linkedin', 'naukri', 'indeed', 'glassdoor', 'internshala'].includes(domainMatch[1])) {
    return domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1)
  }
  return ''
}

function extractLocation(title: string, excerpts: string[]): string {
  const text = title + ' ' + excerpts.join(' ')
  const cities = ['Nagpur', 'Pune', 'Mumbai', 'Bangalore', 'Hyderabad', 'Delhi', 'Noida', 'Chennai', 'Remote', 'India']
  return cities.find(c => text.includes(c)) || ''
}

export function formatJobResults(jobs: JobResult[], agentType: string): string {
  if (!jobs.length) return ''

  const label = agentType === 'internship' ? 'Internship' : 'Job'
  const lines = jobs.map((job, i) => {
    const company = job.company ? ` — *${job.company}*` : ''
    const location = job.location ? ` 📍 ${job.location}` : ''
    const snippet = job.snippet ? `\n   > ${job.snippet.slice(0, 120)}...` : ''
    return `**${i + 1}. [${job.title}](${job.url})**${company}${location}${snippet}`
  })

  return `\n\n---\n\n### 🔍 Live ${label} Listings\n\n${lines.join('\n\n')}\n\n*Results fetched live — click to apply directly*`
}

export function extractJobQuery(message: string): { query: string; objective: string } {
  const isInternship = /internship|intern/i.test(message)
  return {
    query: `${message} ${isInternship ? 'internship' : 'job'} India 2025`,
    objective: 'Find actual job listings with direct apply links'
  }
}
