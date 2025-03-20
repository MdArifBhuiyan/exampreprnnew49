import { extractMCQsFromImage, extractMCQsFromPDF } from './MCQExtractor.js';

const testExtraction = async () => {
  try {
    // Test image extraction
    const imageMCQs = await extractMCQsFromImage('./test.png');
    console.log('Extracted from image:', imageMCQs);

    // Test PDF extraction
    const pdfMCQs = await extractMCQsFromPDF('./test.pdf');
    console.log('Extracted from PDF:', pdfMCQs);
  } catch (error) {
    console.error('Error during extraction:', error);
  }
};

testExtraction();