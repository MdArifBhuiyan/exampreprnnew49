// C:\Projects\ExamPrepRNNew\tests\testMCQExtraction.ts
import { extractMCQsFromImage, extractMCQsFromPDF } from '@components/MCQExtractor';

const testExtraction = async () => {
  try {
    const imageMCQs = await extractMCQsFromImage('./test.png');
    console.log('Extracted from image:', imageMCQs);

    const pdfMCQs = await extractMCQsFromPDF('./test.pdf');
    console.log('Extracted from PDF:', pdfMCQs);
  } catch (error) {
    console.error('Error during extraction:', error);
  }
};
testExtraction();