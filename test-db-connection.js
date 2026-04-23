// Test database connection
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Try to count users
    const userCount = await prisma.user.count()
    console.log('✅ Database connected successfully!')
    console.log(`📊 Total users in database: ${userCount}`)
    
    // List all users (just emails for privacy)
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log('\n👥 Users:')
    users.forEach(user => {
      console.log(`  - ${user.name || 'No name'} (${user.email}) - Created: ${user.createdAt.toLocaleDateString()}`)
    })
    
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
