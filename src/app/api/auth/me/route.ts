import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value || '';
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(decoded.userId) },
    select: { id: true, username: true, email: true, name: true }
  });

  return NextResponse.json({ user: user || null });
}


