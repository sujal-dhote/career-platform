import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

// GET — fetch all messages for a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await params

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const chatSession = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId: user.id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } }
    }
  })

  if (!chatSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  return NextResponse.json({ session: chatSession })
}

// DELETE — delete a chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await params

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  await prisma.chatSession.deleteMany({
    where: { id: sessionId, userId: user.id }
  })

  return NextResponse.json({ success: true })
}
