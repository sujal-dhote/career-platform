import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, theme: true, createdAt: true, _count: { select: { chatSessions: true } } }
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, theme } = await request.json()

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      ...(name && { name }),
      ...(theme && { theme }),
    },
    select: { id: true, name: true, email: true, theme: true }
  })

  return NextResponse.json({ user })
}
