import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')
  
  // Create sample companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Google',
        description: 'A multinational technology company that specializes in Internet-related services and products.',
        industry: 'Technology',
        location: 'Mountain View, CA',
        website: 'https://google.com'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Microsoft',
        description: 'A multinational technology corporation that develops, manufactures, licenses, supports, and sells computer software.',
        industry: 'Technology',
        location: 'Redmond, WA',
        website: 'https://microsoft.com'
      }
    }),
    prisma.company.create({
      data: {
        name: 'Apple',
        description: 'A multinational technology company that designs, develops, and sells consumer electronics.',
        industry: 'Technology',
        location: 'Cupertino, CA',
        website: 'https://apple.com'
      }
    })
  ])

  console.log('Created companies:', companies.length)

  // Create sample opportunities
  await Promise.all([
    // Internships
    prisma.opportunity.create({
      data: {
        title: 'Software Engineering Intern',
        description: 'Join our team as a software engineering intern and work on cutting-edge projects.',
        type: 'internship',
        companyId: companies[0].id,
        location: 'Mountain View, CA',
        requirements: 'Currently pursuing a degree in Computer Science or related field',
        benefits: 'Competitive stipend, mentorship, networking opportunities',
        salary: '$8,000/month'
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Data Science Intern',
        description: 'Work with our data science team to analyze large datasets and build ML models.',
        type: 'internship',
        companyId: companies[1].id,
        location: 'Redmond, WA',
        requirements: 'Experience with Python, SQL, and machine learning',
        benefits: 'Mentorship, training programs, full-time conversion opportunity',
        salary: '$7,500/month'
      }
    }),
    // Jobs
    prisma.opportunity.create({
      data: {
        title: 'Senior Software Engineer',
        description: 'Lead the development of scalable web applications and mentor junior developers.',
        type: 'job',
        companyId: companies[0].id,
        location: 'Mountain View, CA',
        requirements: '5+ years of experience in software development, expertise in React and Node.js',
        benefits: 'Health insurance, 401k, stock options, flexible work arrangements',
        salary: '$180,000 - $220,000'
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Product Manager',
        description: 'Drive product strategy and work cross-functionally to deliver innovative solutions.',
        type: 'job',
        companyId: companies[2].id,
        location: 'Cupertino, CA',
        requirements: '3+ years of product management experience, strong analytical skills',
        benefits: 'Comprehensive benefits, stock purchase plan, professional development',
        salary: '$150,000 - $180,000'
      }
    })
  ])

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })