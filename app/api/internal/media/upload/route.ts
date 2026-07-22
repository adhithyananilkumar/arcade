import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    const uploadUrl = formData.get('uploadUrl') as string;

    if (!file || !uploadUrl) {
      return NextResponse.json({ error: 'Missing file or uploadUrl' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
      body: arrayBuffer,
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to upload to S3', details: await res.text() }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
