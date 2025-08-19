import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Вы вышли из системы' });
  response.cookies.set('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0)
  });
  return response;
}


