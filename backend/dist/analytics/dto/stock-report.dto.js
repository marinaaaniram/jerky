"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockLevelsReportDto = exports.StockMovementsReportDto = exports.StockLevelDto = exports.StockMovementReportDto = void 0;
class StockMovementReportDto {
    id;
    productId;
    productName;
    quantityChange;
    reason;
    reasonText;
    movementDate;
    userId;
    userName;
}
exports.StockMovementReportDto = StockMovementReportDto;
class StockLevelDto {
    id;
    name;
    currentStock;
    price;
    status;
}
exports.StockLevelDto = StockLevelDto;
class StockMovementsReportDto {
    data;
    pagination;
}
exports.StockMovementsReportDto = StockMovementsReportDto;
class StockLevelsReportDto {
    data;
    summary;
}
exports.StockLevelsReportDto = StockLevelsReportDto;
//# sourceMappingURL=stock-report.dto.js.map