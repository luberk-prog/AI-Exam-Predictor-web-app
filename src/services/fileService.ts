import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for pdfjs using Vite's worker import
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file);
  } else if (file.type === 'text/plain') {
    return await file.text();
  } else {
    // For DOCX/PPTX, we'd ideally need a library like mammoth or similar.
    // For MVP, we'll handle PDF and TXT.
    return `[File: ${file.name} - Text extraction not fully implemented for this type in MVP]`;
  }
}
