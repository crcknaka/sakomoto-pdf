import { Slide, SlidesData } from './types';
import { put, list, del } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';

const SLIDES_JSON = 'slides.json';
const LOCAL_DATA_PATH = path.join(process.cwd(), 'data', SLIDES_JSON);

// In dev mode, use local file. In production, use Vercel Blob.
function isProduction(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function getSlides(): Promise<SlidesData> {
  if (isProduction()) {
    try {
      const blobs = await list({ prefix: SLIDES_JSON });
      const blob = blobs.blobs.find(b => b.pathname === SLIDES_JSON);
      if (blob) {
        const res = await fetch(blob.url, { cache: 'no-store' });
        return res.json();
      }
    } catch {
      // fallback to local
    }
  }

  try {
    const data = await fs.readFile(LOCAL_DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { slides: [] };
  }
}

export async function saveSlides(data: SlidesData): Promise<void> {
  const json = JSON.stringify(data, null, 2);

  if (isProduction()) {
    // Delete old blob first
    try {
      const blobs = await list({ prefix: SLIDES_JSON });
      const blob = blobs.blobs.find(b => b.pathname === SLIDES_JSON);
      if (blob) await del(blob.url);
    } catch { /* ignore */ }

    await put(SLIDES_JSON, json, {
      access: 'public',
      contentType: 'application/json',
    });
  }

  // Always save locally too
  await fs.mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  await fs.writeFile(LOCAL_DATA_PATH, json, 'utf-8');
}

export async function uploadImage(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  if (isProduction()) {
    const blob = await put(`images/${filename}`, file, {
      access: 'public',
      contentType,
    });
    return blob.url;
  }

  // Dev mode: save to public/uploads/
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, file);
  return `/uploads/${filename}`;
}

export async function deleteImage(url: string): Promise<void> {
  if (isProduction() && url.includes('blob.vercel-storage.com')) {
    try {
      await del(url);
    } catch { /* ignore */ }
  }
}

export function sortSlides(slides: Slide[]): Slide[] {
  return [...slides].sort((a, b) => a.order - b.order);
}
