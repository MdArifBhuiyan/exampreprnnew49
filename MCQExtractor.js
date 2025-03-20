import Tesseract from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import Jimp from 'jimp';

// Parse extracted text into structured MCQs
const parseMCQs = (text) => {
  const mcqs = [];
  const lines = text.split('\n');

  let currentQuestion = null;
  lines.forEach((line) => {
    if (line.match(/^\d+\./)) { // Detect question lines (e.g., "1. What is...")
      if (currentQuestion) mcqs.push(currentQuestion);
      currentQuestion = { question: line, options: [], answer: '' };
    } else if (line.match(/^[A-D]\./)) { // Detect option lines (e.g., "A. Option 1")
      if (currentQuestion) currentQuestion.options.push(line);
    } else if (line.match(/^Answer:/)) { // Detect answer lines (e.g., "Answer: A")
      if (currentQuestion) currentQuestion.answer = line;
    }
  });

  if (currentQuestion) mcqs.push(currentQuestion);
  return mcqs;
};

// Extract MCQs from an image
const extractMCQsFromImage = async (imagePath) => {
  try {
    // Preprocess the image
    const image = await Jimp.read(imagePath);
    image.grayscale().contrast(0.5); // Convert to grayscale and adjust contrast
    const processedImagePath = './processed.png';
    await image.writeAsync(processedImagePath);

    // Extract text from the processed image
    const { data: { text } } = await Tesseract.recognize(processedImagePath, 'eng');
    return parseMCQs(text); // Return structured MCQs
  } catch (error) {
    console.error('Error extracting MCQs from image:', error);
    return [];
  }
};

// Extract MCQs from a PDF
const extractMCQsFromPDF = async (pdfPath) => {
  try {
    const pdfBytes = fs.readFileSync(pdfPath); // Read the PDF file
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    let text = '';

    for (const page of pages) {
      text += await page.getTextContent();
    }

    return parseMCQs(text); // Return structured MCQs
  } catch (error) {
    console.error('Error extracting MCQs from PDF:', error);
    return [];
  }
};

export { extractMCQsFromImage, extractMCQsFromPDF };