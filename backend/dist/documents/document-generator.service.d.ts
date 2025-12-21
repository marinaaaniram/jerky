import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
export declare class DocumentGeneratorService {
    private ordersRepository;
    constructor(ordersRepository: Repository<Order>);
    getOrderWithDetails(orderId: number): Promise<Order>;
    generateWaybillPDF(orderId: number): Promise<Buffer>;
    getWaybillHTML(orderId: number): Promise<string>;
    generateInvoicePDF(orderId: number): Promise<Buffer>;
    getInvoiceHTML(orderId: number): Promise<string>;
    generateDeliveryReportPDF(orderId: number): Promise<Buffer>;
    getDeliveryReportHTML(orderId: number): Promise<string>;
    generateActOfServicesPDF(orderId: number): Promise<Buffer>;
    getActOfServicesHTML(orderId: number): Promise<string>;
    private htmlToPDF;
}
