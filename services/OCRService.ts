// C:\Projects\ExamPrepRNNew\services\OCRService.ts
import { MCQ } from './DatabaseServices';

export const extractTextFromImage = async (imagePath: string): Promise<string> => {
  // Placeholder implementation
  // In a real app, this would use an OCR library to extract text from the image
  return 'What is the capital of France?, Paris, London, Berlin, Madrid, Paris';
};

export const extractTextFromPDF = async (pdfPath: string): Promise<string> => {
  // Placeholder implementation
  // In a real app, this would use a PDF parsing library to extract text
  return 'What is the capital of Germany?, Paris, London, Berlin, Madrid, Berlin';
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