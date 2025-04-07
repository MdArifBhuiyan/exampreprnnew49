// C:/Projects/ExamPrepRNNew/src/services/OCRService.ts
import { MCQ } from './DatabaseServices';
import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';

export const extractTextFromImage = async (imagePath: string): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

export const extractTextFromPDF = async (pdfPath: string): Promise<string> => {
  try {
    const pdfBuffer = await fetch(pdfPath).then(res => res.arrayBuffer());
    // Convert ArrayBuffer to Buffer for pdf-parse
    const buffer = Buffer.from(pdfBuffer);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF Text Extraction Error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const parseQuestionsFromText = (text: string): MCQ[] => {
  try {
    // Split the text into lines
    const lines = text.split('\n').filter((line) => line.trim() !== '');

    // Assume each line is in the format: "Question, Option1, Option2, Option3, Option4, Answer"
    const questions: MCQ[] = lines.map((line, index) => {
      const parts = line.split(',').map((part) => part.trim());
      if (parts.length < 6) {
        throw new Error(`Invalid format for question at line ${index + 1}`);
      }

      const question = parts[0];
      const options = parts.slice(1, 5); // Options 1 to 4
      const answer = parts[5];

      return {
        question,
        options,
        answer,
        explanation: '', // No pre-stored explanation as per requirement
      };
    });

    return questions;
  } catch (error) {
    console.error('Error parsing questions:', error);
    throw error;
  }
};