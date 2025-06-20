"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ContactFormComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var ContactFormComponent = /** @class */ (function () {
    function ContactFormComponent(form, contactService) {
        this.form = form;
        this.contactService = contactService;
    }
    ContactFormComponent.prototype.ngOnInit = function () {
        this.contactForm = this.form.group({
            name: ['', [forms_1.Validators.required]],
            email: ['', [forms_1.Validators.required, forms_1.Validators.email]],
            phone: ['', [forms_1.Validators.required, forms_1.Validators.min(10)]]
        });
    };
    ContactFormComponent.prototype.onSave = function () {
        console.log(this.contactForm.value);
        var newContact = {
            name: this.contactForm.value.name,
            email: this.contactForm.value.email,
            phone: this.contactForm.value.phone
        };
        this.contactService.addContact(newContact);
    };
    ContactFormComponent = __decorate([
        core_1.Component({
            selector: 'app-contact-form',
            imports: [
                common_1.CommonModule,
                forms_1.ReactiveFormsModule,
                forms_1.FormsModule,
            ],
            templateUrl: './contact-form.component.html',
            styleUrl: './contact-form.component.scss'
        })
    ], ContactFormComponent);
    return ContactFormComponent;
}());
exports.ContactFormComponent = ContactFormComponent;
