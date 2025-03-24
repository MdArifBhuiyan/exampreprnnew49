// C:\Projects\ExamPrepRNNew\MCQExtractor.ts
import { extractTextFromImage, extractTextFromPDF, parseQuestionsFromText } from './services/OCRService';

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  id?: number; // Optional id
}

// Parse extracted text into structured MCQs
const parseMCQs = (text: string): MCQ[] => {
  const mcqs: MCQ[] = [];
  const lines = text.split('\n');

  let currentQuestion: MCQ | null = null;
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
export const extractMCQsFromImage = async (imagePath: string): Promise<MCQ[]> => {
  try {
    const text = await extractTextFromImage(imagePath);
    return parseMCQs(text);
  } catch (error) {
    console.error('Error extracting MCQs from image:', error);
    throw new Error('Failed to extract MCQs from image');
  }
};

// Extract MCQs from a PDF
export const extractMCQsFromPDF = async (pdfPath: string): Promise<MCQ[]> => {
  try {
    const text = await extractTextFromPDF(pdfPath);
    return parseMCQs(text);
  } catch (error) {
    console.error('Error extracting MCQs from PDF:', error);
    throw new Error('Failed to extract MCQs from PDF');
  }
};