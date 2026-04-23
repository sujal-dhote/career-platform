import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// GET — fetch all chat sessions for logged-in user
export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const sessions = await prisma.chatSession.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      agentType: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } }
    }
  })

  return NextResponse.json({ sessions })
}

// POST — create a new chat session
export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { agentType, title } = await request.json()

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: user.id,
      agentType,
      title: title || `${agentType} chat`
    }
  })

  return NextResponse.json({ session: chatSession })
}
