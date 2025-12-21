import type { Response } from 'express';
import { DocumentGeneratorService } from './document-generator.service';
export declare class DocumentController {
    private documentGeneratorService;
    constructor(documentGeneratorService: DocumentGeneratorService);
    getWaybillPDF(orderId: string, res: Response): Promise<void>;
    getWaybillHTML(orderId: string): Promise<{
        html: string;
    }>;
    getInvoicePDF(orderId: string, res: Response): Promise<void>;
    getInvoiceHTML(orderId: string): Promise<{
        html: string;
    }>;
    getDeliveryReportPDF(orderId: string, res: Response): Promise<void>;
    getDeliveryReportHTML(orderId: string): Promise<{
        html: string;
    }>;
    getActOfServicesPDF(orderId: string, res: Response): Promise<void>;
    getActOfServicesHTML(orderId: string): Promise<{
        html: string;
    }>;
}
