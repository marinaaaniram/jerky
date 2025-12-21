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
exports.Customer = exports.PaymentType = void 0;
const typeorm_1 = require("typeorm");
const order_entity_1 = require("../../orders/entities/order.entity");
const payment_entity_1 = require("../../payments/entities/payment.entity");
const price_rule_entity_1 = require("../../price-rules/entities/price-rule.entity");
const customer_comment_entity_1 = require("./customer-comment.entity");
const customer_interaction_entity_1 = require("./customer-interaction.entity");
var PaymentType;
(function (PaymentType) {
    PaymentType["DIRECT"] = "\u043F\u0440\u044F\u043C\u044B\u0435";
    PaymentType["CONSIGNMENT"] = "\u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
let Customer = class Customer {
    id;
    name;
    address;
    phone;
    paymentType;
    debt;
    isArchived;
    orders;
    payments;
    priceRules;
    comments;
    interactions;
    createdAt;
    updatedAt;
};
exports.Customer = Customer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Customer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Customer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Customer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'payment_type',
        type: 'enum',
        enum: PaymentType,
        default: PaymentType.DIRECT
    }),
    __metadata("design:type", String)
], Customer.prototype, "paymentType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(String(value)),
        },
    }),
    __metadata("design:type", Number)
], Customer.prototype, "debt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_archived', default: false }),
    __metadata("design:type", Boolean)
], Customer.prototype, "isArchived", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, order => order.customer),
    __metadata("design:type", Array)
], Customer.prototype, "orders", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, payment => payment.customer),
    __metadata("design:type", Array)
], Customer.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => price_rule_entity_1.PriceRule, priceRule => priceRule.customer),
    __metadata("design:type", Array)
], Customer.prototype, "priceRules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_comment_entity_1.CustomerComment, comment => comment.customer, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Customer.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_interaction_entity_1.CustomerInteraction, interaction => interaction.customer, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Customer.prototype, "interactions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Customer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Customer.prototype, "updatedAt", void 0);
exports.Customer = Customer = __decorate([
    (0, typeorm_1.Entity)('customers'),
    (0, typeorm_1.Index)(['isArchived'])
], Customer);
//# sourceMappingURL=customer.entity.js.map