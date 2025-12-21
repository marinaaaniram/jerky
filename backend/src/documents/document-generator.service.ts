import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import type { Browser } from 'puppeteer';
import puppeteer from 'puppeteer';
import { Order } from '../orders/entities/order.entity';
import { WaybillTemplate } from './templates/waybill.template';
import { InvoiceTemplate } from './templates/invoice.template';
import { DeliveryReportTemplate } from './templates/delivery-report.template';
import { ActOfServicesTemplate } from './templates/act-of-services.template';

@Injectable()
export class DocumentGeneratorService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async getOrderWithDetails(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'orderItems', 'orderItems.product', 'deliverySurvey'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    return order;
  }

  async generateWaybillPDF(orderId: number): Promise<Buffer> {
    const order = await this.getOrderWithDetails(orderId);
    const html = new WaybillTemplate(order).generate();
    return this.htmlToPDF(html);
  }

  async getWaybillHTML(orderId: number): Promise<string> {
    const order = await this.getOrderWithDetails(orderId);
    return new WaybillTemplate(order).generate();
  }

  async generateInvoicePDF(orderId: number): Promise<Buffer> {
    const order = await this.getOrderWithDetails(orderId);
    const html = new InvoiceTemplate(order).generate();
    return this.htmlToPDF(html);
  }

  async getInvoiceHTML(orderId: number): Promise<string> {
    const order = await this.getOrderWithDetails(orderId);
    return new InvoiceTemplate(order).generate();
  }

  async generateDeliveryReportPDF(orderId: number): Promise<Buffer> {
    const order = await this.getOrderWithDetails(orderId);
    const html = new DeliveryReportTemplate(order).generate();
    return this.htmlToPDF(html);
  }

  async getDeliveryReportHTML(orderId: number): Promise<string> {
    const order = await this.getOrderWithDetails(orderId);
    return new DeliveryReportTemplate(order).generate();
  }

  async generateActOfServicesPDF(orderId: number): Promise<Buffer> {
    const order = await this.getOrderWithDetails(orderId);
    const html = new ActOfServicesTemplate(order).generate();
    return this.htmlToPDF(html);
  }

  async getActOfServicesHTML(orderId: number): Promise<string> {
    const order = await this.getOrderWithDetails(orderId);
    return new ActOfServicesTemplate(order).generate();
  }

  private async htmlToPDF(html: string): Promise<Buffer> {
    let browser: Browser | null = null;
    try {
      // Launch browser in headless mode
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      // Set content and wait for all resources to load
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF with A4 formatting
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
}
