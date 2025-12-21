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
exports.CustomerInteraction = exports.CustomerInteractionType = void 0;
const typeorm_1 = require("typeorm");
const customer_entity_1 = require("./customer.entity");
const user_entity_1 = require("../../users/entities/user.entity");
var CustomerInteractionType;
(function (CustomerInteractionType) {
    CustomerInteractionType["ORDER_CREATED"] = "ORDER_CREATED";
    CustomerInteractionType["ORDER_DELIVERED"] = "ORDER_DELIVERED";
    CustomerInteractionType["PAYMENT_RECEIVED"] = "PAYMENT_RECEIVED";
    CustomerInteractionType["CUSTOMER_DATA_UPDATED"] = "CUSTOMER_DATA_UPDATED";
    CustomerInteractionType["ARCHIVED"] = "ARCHIVED";
    CustomerInteractionType["UNARCHIVED"] = "UNARCHIVED";
})(CustomerInteractionType || (exports.CustomerInteractionType = CustomerInteractionType = {}));
let CustomerInteraction = class CustomerInteraction {
    id;
    customerId;
    customer;
    userId;
    user;
    type;
    description;
    metadata;
    createdAt;
};
exports.CustomerInteraction = CustomerInteraction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CustomerInteraction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CustomerInteraction.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, (customer) => customer.interactions, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'customerId' }),
    __metadata("design:type", customer_entity_1.Customer)
], CustomerInteraction.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CustomerInteraction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, {
        eager: true,
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], CustomerInteraction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', { enum: CustomerInteractionType }),
    __metadata("design:type", String)
], CustomerInteraction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], CustomerInteraction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], CustomerInteraction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomerInteraction.prototype, "createdAt", void 0);
exports.CustomerInteraction = CustomerInteraction = __decorate([
    (0, typeorm_1.Entity)('customer_interaction'),
    (0, typeorm_1.Index)(['customerId', 'type', 'createdAt']),
    (0, typeorm_1.Index)(['customerId', 'createdAt'])
], CustomerInteraction);
//# sourceMappingURL=customer-interaction.entity.js.map