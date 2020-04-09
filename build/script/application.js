"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
var ProjectArchivist;
(function (ProjectArchivist) {
    let mainPage;
    let itemPage;
    let exclPage;
    jquery_1.default(document).ready(function () {
        mainPage = jquery_1.default("#Page_Main");
        itemPage = jquery_1.default("#Page_Item");
        exclPage = jquery_1.default("#Page_Excl");
        mainPage.toggleClass("current-page");
        itemPage.toggleClass("hidden-page");
        exclPage.toggleClass("hidden-page");
    });
})(ProjectArchivist || (ProjectArchivist = {}));
//# sourceMappingURL=application.js.map