// C:\Projects\ExamPrepRNNew\types\pdf-parse.d.ts
declare module 'pdf-parse' {
    interface PdfParseResult {
      text: string;
      numpages: number;
      numrender: number;
      info: any;
      metadata: any;
      version: string;
    }
  
    function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>;
  
    export default pdfParse;
  }