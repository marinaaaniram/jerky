"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customers_service_1 = require("./customers.service");
const customers_controller_1 = require("./customers.controller");
const customer_entity_1 = require("./entities/customer.entity");
const customer_comment_entity_1 = require("./entities/customer-comment.entity");
const customer_interaction_entity_1 = require("./entities/customer-interaction.entity");
const customer_comment_service_1 = require("./services/customer-comment.service");
const customer_interaction_service_1 = require("./services/customer-interaction.service");
let CustomersModule = class CustomersModule {
};
exports.CustomersModule = CustomersModule;
exports.CustomersModule = CustomersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([customer_entity_1.Customer, customer_comment_entity_1.CustomerComment, customer_interaction_entity_1.CustomerInteraction]),
        ],
        controllers: [customers_controller_1.CustomersController],
        providers: [customers_service_1.CustomersService, customer_comment_service_1.CustomerCommentService, customer_interaction_service_1.CustomerInteractionService],
        exports: [customers_service_1.CustomersService, customer_comment_service_1.CustomerCommentService, customer_interaction_service_1.CustomerInteractionService],
    })
], CustomersModule);
//# sourceMappingURL=customers.module.js.map