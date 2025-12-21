import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { DocumentGeneratorService } from './document-generator.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private documentGeneratorService: DocumentGeneratorService) {}

  // Waybill (Накладная)
  @Get('orders/:id/waybill/pdf')
  async getWaybillPDF(@Param('id') orderId: string, @Res() res: Response) {
    const pdf = await this.documentGeneratorService.generateWaybillPDF(Number(orderId));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="waybill_${orderId}.pdf"`,
    });
    res.send(pdf);
  }

  @Get('orders/:id/waybill/html')
  async getWaybillHTML(@Param('id') orderId: string) {
    return {
      html: await this.documentGeneratorService.getWaybillHTML(Number(orderId)),
    };
  }

  // Invoice (Счет-фактура)
  @Get('orders/:id/invoice/pdf')
  async getInvoicePDF(@Param('id') orderId: string, @Res() res: Response) {
    const pdf = await this.documentGeneratorService.generateInvoicePDF(Number(orderId));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice_${orderId}.pdf"`,
    });
    res.send(pdf);
  }

  @Get('orders/:id/invoice/html')
  async getInvoiceHTML(@Param('id') orderId: string) {
    return {
      html: await this.documentGeneratorService.getInvoiceHTML(Number(orderId)),
    };
  }

  // Delivery Report (Отчет о доставке)
  @Get('orders/:id/delivery-report/pdf')
  async getDeliveryReportPDF(@Param('id') orderId: string, @Res() res: Response) {
    const pdf = await this.documentGeneratorService.generateDeliveryReportPDF(Number(orderId));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="delivery_report_${orderId}.pdf"`,
    });
    res.send(pdf);
  }

  @Get('orders/:id/delivery-report/html')
  async getDeliveryReportHTML(@Param('id') orderId: string) {
    return {
      html: await this.documentGeneratorService.getDeliveryReportHTML(Number(orderId)),
    };
  }

  // Act of Services (Акт выполненных работ)
  @Get('orders/:id/act-of-services/pdf')
  async getActOfServicesPDF(@Param('id') orderId: string, @Res() res: Response) {
    const pdf = await this.documentGeneratorService.generateActOfServicesPDF(Number(orderId));
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="act_of_services_${orderId}.pdf"`,
    });
    res.send(pdf);
  }

  @Get('orders/:id/act-of-services/html')
  async getActOfServicesHTML(@Param('id') orderId: string) {
    return {
      html: await this.documentGeneratorService.getActOfServicesHTML(Number(orderId)),
    };
  }
}
