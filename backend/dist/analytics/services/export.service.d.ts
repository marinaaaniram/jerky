import * as ExcelJS from 'exceljs';
export declare class AnalyticsExportService {
    htmlToPDF(html: string): Promise<Buffer>;
    createExcelWorkbook(): Promise<ExcelJS.Workbook>;
    excelToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer>;
    styleExcelHeader(worksheet: ExcelJS.Worksheet, rowNumber?: number): void;
    autoFitColumns(worksheet: ExcelJS.Worksheet): void;
}
