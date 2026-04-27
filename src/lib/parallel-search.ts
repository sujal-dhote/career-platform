// Job Search — generates proper working search links using known job portal URL patterns

export function generateJobLinks(message: string, agentType: string): string {
  const msg = message.toLowerCase()
  const isInternship = agentType === 'internship' || /internship|intern|training/i.test(msg)

  // Extract role from message
  const roles = [
    'python developer', 'java developer', 'javascript developer', 'react developer',
    'node.js developer', 'angular developer', 'vue developer', 'full stack developer',
    'frontend developer', 'backend developer', '.net developer', 'dotnet developer',
    'php developer', 'android developer', 'ios developer', 'flutter developer',
    'data scientist', 'data analyst', 'machine learning engineer', 'ai engineer',
    'devops engineer', 'cloud engineer', 'aws engineer', 'cybersecurity analyst',
    'ui ux designer', 'graphic designer', 'digital marketing', 'seo specialist',
    'content writer', 'business analyst', 'project manager', 'software engineer',
    'web developer', 'mobile developer', 'database administrator', 'sql developer'
  ]

  let detectedRole = roles.find(r => msg.includes(r)) || ''

  // Single word tech detection
  if (!detectedRole) {
    const techs = ['python', 'java', 'react', 'angular', 'node', 'flutter', 'android',
      'php', 'dotnet', '.net', 'devops', 'aws', 'data science', 'machine learning',
      'ui ux', 'graphic', 'marketing', 'seo', 'content']
    const found = techs.find(t => msg.includes(t))
    if (found) detectedRole = found + (isInternship ? ' intern' : ' developer')
  }

  if (!detectedRole) detectedRole = isInternship ? 'software intern' : 'software developer'

  // Location detection
  const cities = ['nagpur', 'pune', 'mumbai', 'bangalore', 'bengaluru', 'hyderabad',
    'delhi', 'noida', 'gurgaon', 'chennai', 'kolkata', 'ahmedabad', 'remote']
  const city = cities.find(c => msg.includes(c)) || ''

  // Encode for URLs
  const roleEncoded = encodeURIComponent(detectedRole)
  const cityEncoded = city ? encodeURIComponent(city) : ''
  const roleSlug = detectedRole.replace(/\s+/g, '-').replace(/\./g, '')
  const citySlug = city ? city.replace(/\s+/g, '-') : ''

  const links: string[] = []

  if (isInternship) {
    // Internshala — best for Indian internships
    const internshalaQuery = encodeURIComponent(detectedRole.replace(' intern', '').replace(' developer', ''))
    links.push(`1. 🎓 **[Internshala — ${detectedRole}](https://internshala.com/internships/${internshalaQuery.toLowerCase()}-internship/)** — India's top internship platform`)

    // LinkedIn Internships
    const liQuery = encodeURIComponent(detectedRole + ' internship ' + city)
    links.push(`2. 💼 **[LinkedIn — ${detectedRole} Internship](https://www.linkedin.com/jobs/search/?keywords=${liQuery}&f_JT=I)** — Professional network jobs`)

    // Indeed Internships
    const indeedQ = encodeURIComponent(detectedRole + ' internship')
    const indeedL = cityEncoded || 'India'
    links.push(`3. 🔍 **[Indeed — ${detectedRole} Internship](https://in.indeed.com/jobs?q=${indeedQ}&l=${indeedL})** — Thousands of listings`)

    // Naukri Fresher
    links.push(`4. 📋 **[Naukri — Fresher ${detectedRole}](https://www.naukri.com/${roleSlug}-jobs${citySlug ? '-in-' + citySlug : ''}?experience=0)** — India's #1 job portal`)

    // Unstop
    links.push(`5. 🏆 **[Unstop — ${detectedRole} Internship](https://unstop.com/internships?search=${roleEncoded})** — Competitions & internships`)

  } else {
    // LinkedIn Jobs
    const liQuery = encodeURIComponent(detectedRole + ' ' + city)
    links.push(`1. 💼 **[LinkedIn — ${detectedRole} Jobs](https://www.linkedin.com/jobs/search/?keywords=${liQuery})** — Professional network`)

    // Naukri
    links.push(`2. 📋 **[Naukri — ${detectedRole}](https://www.naukri.com/${roleSlug}-jobs${citySlug ? '-in-' + citySlug : ''})** — India's #1 job portal`)

    // Indeed
    const indeedQ = encodeURIComponent(detectedRole)
    const indeedL = cityEncoded || 'India'
    links.push(`3. 🔍 **[Indeed — ${detectedRole}](https://in.indeed.com/jobs?q=${indeedQ}&l=${indeedL})** — Global job search`)

    // Glassdoor
    const gdRole = roleSlug
    links.push(`4. ⭐ **[Glassdoor — ${detectedRole}](https://www.glassdoor.co.in/Job/${gdRole}-jobs-SRCH_KO0,${gdRole.length}.htm)** — Jobs + company reviews`)

    // Shine
    links.push(`5. ✨ **[Shine — ${detectedRole}](https://www.shine.com/job-search/${roleSlug}-jobs${citySlug ? '-in-' + citySlug : ''})** — Quick apply jobs`)

    // Wellfound for tech
    if (/developer|engineer|data|devops|cloud|ai|ml/i.test(detectedRole)) {
      links.push(`6. 🚀 **[Wellfound — ${detectedRole}](https://wellfound.com/jobs?q=${roleEncoded})** — Startup jobs`)
    }
  }

  return links.join('\n\n')
}

// Keep Parallel AI search as optional enhancement
export async function searchJobs(query: string, objective: string): Promise<string> {
  const apiKey = process.env.PARALLEL_AI_KEY
  if (!apiKey) return ''

  try {
    const response = await fetch('https://api.parallel.ai/v1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        search_queries: [query],
        mode: 'advanced',
        advanced_settings: { max_results: 5 },
        objective,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) return ''

    const data = await response.json()
    const results = data.results || []

    return results
      .filter((r: any) => r.url && r.title && !r.url.includes('linkedin.com/in/'))
      .slice(0, 4)
      .map((r: any, i: number) => `${i + 1}. **[${r.title}](${r.url})**`)
      .join('\n\n')
  } catch {
    return ''
  }
}

export function extractJobQuery(message: string): { query: string; objective: string } {
  const isInternship = /internship|intern|training/i.test(message)
  const type = isInternship ? 'internship' : 'job'
  return {
    query: `${message} ${type} India 2025 apply`,
    objective: `Find ${type} openings with direct apply links`
  }
}
