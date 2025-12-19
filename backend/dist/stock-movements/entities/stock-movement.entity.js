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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovement = exports.MovementReason = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
var MovementReason;
(function (MovementReason) {
    MovementReason["ARRIVAL"] = "\u043F\u0440\u0438\u0445\u043E\u0434";
    MovementReason["SALE"] = "\u043F\u0440\u043E\u0434\u0430\u0436\u0430";
    MovementReason["WRITEOFF"] = "\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435";
})(MovementReason || (exports.MovementReason = MovementReason = {}));
let StockMovement = class StockMovement {
    id;
    productId;
    product;
    quantityChange;
    reason;
    movementDate;
    createdAt;
};
exports.StockMovement = StockMovement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StockMovement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    __metadata("design:type", Number)
], StockMovement.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, product => product.stockMovements),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], StockMovement.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantity_change', type: 'int' }),
    __metadata("design:type", Number)
], StockMovement.prototype, "quantityChange", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MovementReason
    }),
    __metadata("design:type", String)
], StockMovement.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'movement_date', type: 'date' }),
    __metadata("design:type", Date)
], StockMovement.prototype, "movementDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], StockMovement.prototype, "createdAt", void 0);
exports.StockMovement = StockMovement = __decorate([
    (0, typeorm_1.Entity)('stock_movements'),
    (0, typeorm_1.Index)(['movementDate'])
], StockMovement);
//# sourceMappingURL=stock-movement.entity.js.map