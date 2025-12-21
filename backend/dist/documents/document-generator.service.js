"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const pdfkit_1 = __importDefault(require("pdfkit"));
const order_entity_1 = require("../orders/entities/order.entity");
const waybill_template_1 = require("./templates/waybill.template");
const invoice_template_1 = require("./templates/invoice.template");
const delivery_report_template_1 = require("./templates/delivery-report.template");
const act_of_services_template_1 = require("./templates/act-of-services.template");
let DocumentGeneratorService = class DocumentGeneratorService {
    ordersRepository;
    constructor(ordersRepository) {
        this.ordersRepository = ordersRepository;
    }
    async getOrderWithDetails(orderId) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['customer', 'orderItems', 'orderItems.product', 'deliverySurvey'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with id ${orderId} not found`);
        }
        return order;
    }
    async generateWaybillPDF(orderId) {
        const order = await this.getOrderWithDetails(orderId);
        const html = new waybill_template_1.WaybillTemplate(order).generate();
        return this.htmlToPDF(html);
    }
    async getWaybillHTML(orderId) {
        const order = await this.getOrderWithDetails(orderId);
        return new waybill_template_1.WaybillTemplate(order).generate();
    }
    async generateInvoicePDF(orderId) {
        const order = await this.getOrderWithDetails(orderId);
        const html = new invoice_template_1.InvoiceTemplate(order).generate();
        return this.htmlToPDF(html);
    }
    async getInvoiceHTML(orderId) {
        const order = await this.getOrderWithDetails(orderId);
        return new invoice_template_1.InvoiceTemplate(order).generate();
    }
    async generateDeliveryReportPDF(orderId) {
        const order = await this.getOrderWithDetails(orderId);
        const html = new delivery_report_template_1.DeliveryReportTemplate(order).generate();
        return this.htmlToPDF(html);
    }
    async getDeliveryReportHTML(orderId) {
        const order = await this.getOrderWithDetails(orderId);
        return new delivery_report_template_1.DeliveryReportTemplate(order).generate();
    }
    async generateActOfServicesPDF(orderId) {
        const order = await this.getOrderWithDetails(orderId);
        const html = new act_of_services_template_1.ActOfServicesTemplate(order).generate();
        return this.htmlToPDF(html);
    }
    async getActOfServicesHTML(orderId) {
        const order = await this.getOrderWithDetails(orderId);
        return new act_of_services_template_1.ActOfServicesTemplate(order).generate();
    }
    htmlToPDF(html) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({
                bufferPages: true,
                margin: 40,
            });
            const chunks = [];
            doc.on('data', (chunk) => {
                chunks.push(chunk);
            });
            doc.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            doc.on('error', (err) => {
                reject(err);
            });
            this.renderHTMLToPDF(doc, html);
            doc.end();
        });
    }
    renderHTMLToPDF(doc, html) {
        const textContent = html.replace(/<[^>]*>/g, '');
        const lines = textContent.split('\n').filter(line => line.trim());
        doc.fontSize(11).font('Helvetica');
        lines.forEach((line) => {
            if (line.trim()) {
                doc.text(line.trim(), { align: 'left' });
            }
        });
    }
};
exports.DocumentGeneratorService = DocumentGeneratorService;
exports.DocumentGeneratorService = DocumentGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], DocumentGeneratorService);
//# sourceMappingURL=document-generator.service.js.map