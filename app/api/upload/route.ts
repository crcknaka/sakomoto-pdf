import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/slides';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const filename = formData.get('filename') as string | null;

  if (!file || !filename) {
    return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadImage(buffer, filename, file.type);

  return NextResponse.json({ url });
}
