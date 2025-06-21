"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ContactListComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var rxjs_1 = require("rxjs");
var ContactListComponent = /** @class */ (function () {
    function ContactListComponent(contactService) {
        this.contactService = contactService;
        this.groupedContacts = {};
        this.selectedContact = null; //NEU
        this.contactsSubscription = new rxjs_1.Subscription();
        this.selectionSubscription = new rxjs_1.Subscription(); //NEU
        this.keyAsc = function (a, b) { return a.key.localeCompare(b.key); };
    }
    ContactListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.contactsSubscription = this.contactService.getContacts().subscribe({
            next: function (contacts) {
                _this.groupedContacts = _this.groupByInitial(contacts);
            },
            error: function (error) {
                console.error('Error loading contacts:', error);
            }
        });
        //NEU Aktuelle Auswahl verfolgen für visuelle Hervorhebung
        this.selectionSubscription = this.contactService.selectedContact$.subscribe(function (contact) { return _this.selectedContact = contact; });
    };
    ContactListComponent.prototype.ngOnDestroy = function () {
        this.contactsSubscription.unsubscribe();
        this.selectionSubscription.unsubscribe(); //NEU
    };
    //NEU
    ContactListComponent.prototype.onContactSelect = function (contact) {
        this.contactService.selectContact(contact);
    };
    //NEU
    ContactListComponent.prototype.isSelected = function (contact) {
        var _a;
        return ((_a = this.selectedContact) === null || _a === void 0 ? void 0 : _a.id) === contact.id;
    };
    ContactListComponent.prototype.groupByInitial = function (contacts) {
        var validContacts = contacts.filter(function (contact) { return contact && contact.name; });
        return validContacts.reduce(function (groups, contact) {
            var initial = contact.name.charAt(0).toUpperCase();
            groups[initial] = groups[initial] || [];
            groups[initial].push(contact);
            groups[initial].sort(function (a, b) { return a.name.localeCompare(b.name); });
            return groups;
        }, {});
    };
    ContactListComponent.prototype.getInitials = function (name) {
        if (!name)
            return '?';
        var nameParts = name.trim().split(' ');
        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }
        var firstInitial = nameParts[0].charAt(0).toUpperCase();
        var lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        return firstInitial + lastInitial;
    };
    ContactListComponent = __decorate([
        core_1.Component({
            selector: 'app-contact-list',
            standalone: true,
            imports: [common_1.CommonModule],
            templateUrl: './contact-list.component.html',
            styleUrls: ['./contact-list.component.scss']
        })
    ], ContactListComponent);
    return ContactListComponent;
}());
exports.ContactListComponent = ContactListComponent;
