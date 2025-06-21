"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ContactService = exports.notOnlyWhitespace = void 0;
var core_1 = require("@angular/core");
var firestore_1 = require("@angular/fire/firestore");
var rxjs_1 = require("rxjs");
function notOnlyWhitespace(control) {
    var value = control.value;
    if (typeof value === 'string' && value.trim().length === 0) {
        return { whitespace: true };
    }
    return null;
}
exports.notOnlyWhitespace = notOnlyWhitespace;
var ContactService = /** @class */ (function () {
    function ContactService(firestore) {
        this.firestore = firestore;
    }
    ContactService.prototype.getContacts = function () {
        var _this = this;
        return new rxjs_1.Observable(function (observer) {
            var contactsRef = _this.getContactsRef();
            var unsubscribe = firestore_1.onSnapshot(contactsRef, function (snapshot) {
                var contacts = [];
                snapshot.forEach(function (doc) {
                    contacts.push(__assign({ id: doc.id }, doc.data()));
                });
                observer.next(contacts);
            }, function (error) {
                observer.error(error);
            });
            // Cleanup-Funktion zurückgeben
            return function () { return unsubscribe(); };
        });
    };
    ContactService.prototype.getContactsRef = function () {
        return firestore_1.collection(this.firestore, 'contacts');
    };
    ContactService.prototype.addContact = function (newContact) {
        return __awaiter(this, void 0, void 0, function () {
            var contactsRef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contactsRef = this.getContactsRef();
                        return [4 /*yield*/, firestore_1.addDoc(contactsRef, newContact)["catch"](function (err) { console.log(err); }).then(function (newRef) { console.log('New Contact list added with id', newRef === null || newRef === void 0 ? void 0 : newRef.id); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContactService.prototype.updateContact = function (id, updatedContact) {
        return __awaiter(this, void 0, void 0, function () {
            var docRef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        docRef = firestore_1.doc(firestore_1.collection(this.firestore, 'contacts'), id);
                        return [4 /*yield*/, firestore_1.updateDoc(docRef, this.getCleanJson(updatedContact))["catch"](function (err) { console.error(err); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ContactService.prototype.getCleanJson = function (updatedContact) {
        return {
            name: updatedContact.name,
            email: updatedContact.email,
            phone: updatedContact.phone
        };
    };
    ContactService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], ContactService);
    return ContactService;
}());
exports.ContactService = ContactService;
