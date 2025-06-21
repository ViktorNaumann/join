"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ContactDetailsComponent = void 0;
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var ContactDetailsComponent = /** @class */ (function () {
    function ContactDetailsComponent(contactService) {
        this.contactService = contactService;
    }
    ContactDetailsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.selectedContactSubscription = this.contactService.selectedContact$.subscribe({
            next: function (contact) {
                _this.contact = contact || undefined;
            }
        });
    };
    ContactDetailsComponent.prototype.ngOnDestroy = function () {
        if (this.selectedContactSubscription) {
            this.selectedContactSubscription.unsubscribe();
        }
    };
    ContactDetailsComponent.prototype.getInitials = function (name) {
        if (!name)
            return 'NN';
        return name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase();
    };
    ContactDetailsComponent = __decorate([
        core_1.Component({
            selector: 'app-contact-details',
            imports: [common_1.CommonModule],
            templateUrl: './contact-details.component.html',
            styleUrl: './contact-details.component.scss'
        })
    ], ContactDetailsComponent);
    return ContactDetailsComponent;
}());
exports.ContactDetailsComponent = ContactDetailsComponent;
