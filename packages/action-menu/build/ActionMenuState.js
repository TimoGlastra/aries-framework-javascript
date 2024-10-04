"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionMenuState = void 0;
/**
 * Action Menu states based on the flow defined in RFC 0509.
 *
 * @see https://github.com/hyperledger/aries-rfcs/tree/main/features/0509-action-menu#states
 * @public
 */
var ActionMenuState;
(function (ActionMenuState) {
    ActionMenuState["Null"] = "null";
    ActionMenuState["AwaitingRootMenu"] = "awaiting-root-menu";
    ActionMenuState["PreparingRootMenu"] = "preparing-root-menu";
    ActionMenuState["PreparingSelection"] = "preparing-selection";
    ActionMenuState["AwaitingSelection"] = "awaiting-selection";
    ActionMenuState["Done"] = "done";
})(ActionMenuState || (exports.ActionMenuState = ActionMenuState = {}));
//# sourceMappingURL=ActionMenuState.js.map