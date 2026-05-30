import { NextResponse } from 'next/server';
import { pathToFileURL } from 'url';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = '';

    if (filename.endsWith('.pdf')) {
      try {
        // Dynamically require inside the function so Vercel doesn't crash on startup
        const { PDFParse } = require('pdf-parse');
        
        // Configure worker securely
        try {
          const workerPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
          const workerUrl = pathToFileURL(workerPath).toString();
          PDFParse.setWorker(workerUrl);
        } catch (e) {
          // ignore worker setup errors in production
        }

        const parser = new PDFParse({ data: buffer });
        const result = await parser.getText();
        extractedText = result.text;
      } catch (pdfErr: any) {
        console.error('PDF extraction error details:', pdfErr);
        return NextResponse.json({ error: `Unable to extract PDF: ${pdfErr.message || 'Unknown error'}` }, { status: 422 });
      }
    } else if (filename.endsWith('.docx')) {
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (docxErr: any) {
        console.error('DOCX extraction error details:', docxErr);
        return NextResponse.json({ error: `Unable to extract DOCX: ${docxErr.message || 'Unknown error'}` }, { status: 422 });
      }
    } else {
      return NextResponse.json({ error: 'Only PDF and DOCX files are supported.' }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: 'Unable to extract text from this document.' }, { status: 422 });
    }

    return NextResponse.json({ text: extractedText });

  } catch (error: unknown) {
    console.error('File extraction server error:', error);
    return NextResponse.json({ error: 'Document processing failed. Please try another file.' }, { status: 500 });
  }
}
