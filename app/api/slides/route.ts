import { NextRequest, NextResponse } from 'next/server';
import { getSlides, saveSlides } from '@/lib/slides';
import { isAuthenticated } from '@/lib/auth';
import { SlidesData } from '@/lib/types';

export async function GET() {
  const data = await getSlides();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data: SlidesData = await req.json();
  await saveSlides(data);
  return NextResponse.json({ ok: true });
}
