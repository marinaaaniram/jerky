import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';

@Injectable()
export class AnalyticsExportService {
  async htmlToPDF(html: string): Promise<Buffer> {
    let browser: Browser | null = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
        printBackground: true,
      });

      await page.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      throw new Error(`PDF generation failed: ${(error as Error).message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async createExcelWorkbook(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    return workbook;
  }

  async excelToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  styleExcelHeader(worksheet: ExcelJS.Worksheet, rowNumber: number = 1): void {
    const headerRow = worksheet.getRow(rowNumber);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  autoFitColumns(worksheet: ExcelJS.Worksheet): void {
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      if (column.header) {
        maxLength = String(column.header).length;
      }

      if (column.eachCell) {
        column.eachCell((cell) => {
          const cellLength = String(cell.value).length;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });
      }

      column.width = Math.min(maxLength + 2, 50);
    });
  }
}
