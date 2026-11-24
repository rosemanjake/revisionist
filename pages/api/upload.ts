import fs from 'fs/promises';
import formidable, { type File as FormidableFile } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';
import pdfParse from 'pdf-parse';
import textract from 'textract';
import { ALLOWED_UPLOAD_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from '@/utils/constants';
import type { UploadResponse } from '@/utils/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface HttpError {
  httpCode?: number;
}

function extractWithTextract(mimeType: string, filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    textract.fromFileWithMimeAndPath(mimeType, filePath, (error, text) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(text ?? '');
    });
  });
}

async function extractTextFromFile(file: FormidableFile): Promise<string> {
  const mimeType = file.mimetype ?? '';

  if (mimeType === 'text/plain') {
    return fs.readFile(file.filepath, 'utf8');
  }

  if (mimeType === 'application/pdf') {
    const dataBuffer = await fs.readFile(file.filepath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  return extractWithTextract(mimeType, file.filepath);
}

async function cleanupUploadedFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn('Failed to remove temporary upload file:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const form = formidable({
    maxFileSize: MAX_UPLOAD_SIZE_BYTES,
    maxFiles: 1,
  });

  let uploadedFile: FormidableFile | undefined;

  try {
    const [, files] = await form.parse(req);
    const candidate = files.file;
    uploadedFile = Array.isArray(candidate) ? candidate[0] : candidate;
  } catch (error) {
    const statusCode = (error as HttpError)?.httpCode ?? 400;
    console.error('Error parsing uploaded file:', error);
    res.status(statusCode).json({ error: 'Failed to parse uploaded file.' });
    return;
  }

  if (!uploadedFile) {
    res.status(400).json({ error: 'No file uploaded.' });
    return;
  }

  const mimeType = uploadedFile.mimetype ?? '';
  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(mimeType)) {
    await cleanupUploadedFile(uploadedFile.filepath);
    res.status(400).json({
      error: 'Unsupported file type. Please upload a PDF, DOCX, TXT, or EPUB file.',
    });
    return;
  }

  try {
    const text = await extractTextFromFile(uploadedFile);
    res.status(200).json({ text });
  } catch (error) {
    console.error('Error extracting text from uploaded file:', error);
    res.status(500).json({ error: 'Failed to extract text from file.' });
  } finally {
    await cleanupUploadedFile(uploadedFile.filepath);
  }
}
