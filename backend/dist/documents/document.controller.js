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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const common_1 = require("@nestjs/common");
const document_generator_service_1 = require("./document-generator.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let DocumentController = class DocumentController {
    documentGeneratorService;
    constructor(documentGeneratorService) {
        this.documentGeneratorService = documentGeneratorService;
    }
    async getWaybillPDF(orderId, res) {
        const pdf = await this.documentGeneratorService.generateWaybillPDF(Number(orderId));
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="waybill_${orderId}.pdf"`,
        });
        res.send(pdf);
    }
    async getWaybillHTML(orderId) {
        return {
            html: await this.documentGeneratorService.getWaybillHTML(Number(orderId)),
        };
    }
    async getInvoicePDF(orderId, res) {
        const pdf = await this.documentGeneratorService.generateInvoicePDF(Number(orderId));
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice_${orderId}.pdf"`,
        });
        res.send(pdf);
    }
    async getInvoiceHTML(orderId) {
        return {
            html: await this.documentGeneratorService.getInvoiceHTML(Number(orderId)),
        };
    }
    async getDeliveryReportPDF(orderId, res) {
        const pdf = await this.documentGeneratorService.generateDeliveryReportPDF(Number(orderId));
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="delivery_report_${orderId}.pdf"`,
        });
        res.send(pdf);
    }
    async getDeliveryReportHTML(orderId) {
        return {
            html: await this.documentGeneratorService.getDeliveryReportHTML(Number(orderId)),
        };
    }
    async getActOfServicesPDF(orderId, res) {
        const pdf = await this.documentGeneratorService.generateActOfServicesPDF(Number(orderId));
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="act_of_services_${orderId}.pdf"`,
        });
        res.send(pdf);
    }
    async getActOfServicesHTML(orderId) {
        return {
            html: await this.documentGeneratorService.getActOfServicesHTML(Number(orderId)),
        };
    }
};
exports.DocumentController = DocumentController;
__decorate([
    (0, common_1.Get)('orders/:id/waybill/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getWaybillPDF", null);
__decorate([
    (0, common_1.Get)('orders/:id/waybill/html'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getWaybillHTML", null);
__decorate([
    (0, common_1.Get)('orders/:id/invoice/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getInvoicePDF", null);
__decorate([
    (0, common_1.Get)('orders/:id/invoice/html'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getInvoiceHTML", null);
__decorate([
    (0, common_1.Get)('orders/:id/delivery-report/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDeliveryReportPDF", null);
__decorate([
    (0, common_1.Get)('orders/:id/delivery-report/html'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getDeliveryReportHTML", null);
__decorate([
    (0, common_1.Get)('orders/:id/act-of-services/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getActOfServicesPDF", null);
__decorate([
    (0, common_1.Get)('orders/:id/act-of-services/html'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getActOfServicesHTML", null);
exports.DocumentController = DocumentController = __decorate([
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [document_generator_service_1.DocumentGeneratorService])
], DocumentController);
//# sourceMappingURL=document.controller.js.map