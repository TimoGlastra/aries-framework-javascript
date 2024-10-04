"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateToTimestamp = void 0;
// Timestamps are expressed as Unix epoch time (seconds since 1/1/1970)
const dateToTimestamp = (date) => Math.floor(date.getTime() / 1000);
exports.dateToTimestamp = dateToTimestamp;
//# sourceMappingURL=timestamp.js.map