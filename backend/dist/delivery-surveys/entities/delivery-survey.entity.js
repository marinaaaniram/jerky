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
exports.DeliverySurvey = void 0;
const typeorm_1 = require("typeorm");
const order_entity_1 = require("../../orders/entities/order.entity");
let DeliverySurvey = class DeliverySurvey {
    id;
    orderId;
    order;
    photoUrl;
    stockCheckNotes;
    layoutNotes;
    otherNotes;
    timestamp;
    createdAt;
};
exports.DeliverySurvey = DeliverySurvey;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DeliverySurvey.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_id', unique: true }),
    __metadata("design:type", Number)
], DeliverySurvey.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => order_entity_1.Order, order => order.deliverySurvey),
    (0, typeorm_1.JoinColumn)({ name: 'order_id' }),
    __metadata("design:type", order_entity_1.Order)
], DeliverySurvey.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DeliverySurvey.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock_check_notes', type: 'text' }),
    __metadata("design:type", String)
], DeliverySurvey.prototype, "stockCheckNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'layout_notes', type: 'text' }),
    __metadata("design:type", String)
], DeliverySurvey.prototype, "layoutNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'other_notes', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DeliverySurvey.prototype, "otherNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], DeliverySurvey.prototype, "timestamp", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DeliverySurvey.prototype, "createdAt", void 0);
exports.DeliverySurvey = DeliverySurvey = __decorate([
    (0, typeorm_1.Entity)('delivery_surveys')
], DeliverySurvey);
//# sourceMappingURL=delivery-survey.entity.js.map