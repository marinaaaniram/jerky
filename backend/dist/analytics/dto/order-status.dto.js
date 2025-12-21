"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatusReportDto = exports.OrderStatusDistributionDto = void 0;
class OrderStatusDistributionDto {
    status;
    count;
    percentage;
    color;
}
exports.OrderStatusDistributionDto = OrderStatusDistributionDto;
class OrderStatusReportDto {
    distribution;
    totalOrders;
    totalDelivered;
    totalInProgress;
    averageDeliveryTime;
}
exports.OrderStatusReportDto = OrderStatusReportDto;
//# sourceMappingURL=order-status.dto.js.map