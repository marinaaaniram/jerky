"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebtorsReportDto = exports.TopCustomersReportDto = exports.DebtorDto = exports.TopCustomerDto = void 0;
class TopCustomerDto {
    id;
    name;
    phone;
    totalOrders;
    totalRevenue;
    averageOrderValue;
    lastOrderDate;
    paymentType;
}
exports.TopCustomerDto = TopCustomerDto;
class DebtorDto {
    id;
    name;
    phone;
    currentDebt;
    lastPaymentDate;
    lastOrderDate;
}
exports.DebtorDto = DebtorDto;
class TopCustomersReportDto {
    data;
    pagination;
}
exports.TopCustomersReportDto = TopCustomersReportDto;
class DebtorsReportDto {
    data;
    totalDebt;
    pagination;
}
exports.DebtorsReportDto = DebtorsReportDto;
//# sourceMappingURL=customer-report.dto.js.map