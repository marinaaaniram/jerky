"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRangeHelper = void 0;
const time_filter_dto_1 = require("../dto/time-filter.dto");
class DateRangeHelper {
    static getDateRange(period, startDate, endDate) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        switch (period) {
            case time_filter_dto_1.PeriodType.DAY:
                return {
                    startDate: new Date(now),
                    endDate: new Date(now),
                };
            case time_filter_dto_1.PeriodType.WEEK:
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                return { startDate: weekStart, endDate: weekEnd };
            case time_filter_dto_1.PeriodType.MONTH:
                return {
                    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
                    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
                };
            case time_filter_dto_1.PeriodType.QUARTER:
                const quarter = Math.floor(now.getMonth() / 3);
                return {
                    startDate: new Date(now.getFullYear(), quarter * 3, 1),
                    endDate: new Date(now.getFullYear(), quarter * 3 + 3, 0),
                };
            case time_filter_dto_1.PeriodType.YEAR:
                return {
                    startDate: new Date(now.getFullYear(), 0, 1),
                    endDate: new Date(now.getFullYear(), 11, 31),
                };
            case time_filter_dto_1.PeriodType.ALL:
                return {
                    startDate: new Date('2020-01-01'),
                    endDate: new Date(),
                };
            case time_filter_dto_1.PeriodType.CUSTOM:
                if (!startDate || !endDate) {
                    throw new Error('startDate and endDate are required for CUSTOM period');
                }
                return {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                };
            default:
                throw new Error(`Unknown period type: ${period}`);
        }
    }
    static formatPeriodLabel(period, date) {
        const d = date || new Date();
        switch (period) {
            case time_filter_dto_1.PeriodType.DAY:
                return d.toLocaleDateString('ru-RU');
            case time_filter_dto_1.PeriodType.WEEK:
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
                return `Неделя с ${weekStart.toLocaleDateString('ru-RU')}`;
            case time_filter_dto_1.PeriodType.MONTH:
                return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
            case time_filter_dto_1.PeriodType.QUARTER:
                const quarter = Math.floor(d.getMonth() / 3) + 1;
                return `Q${quarter} ${d.getFullYear()}`;
            case time_filter_dto_1.PeriodType.YEAR:
                return `${d.getFullYear()}`;
            case time_filter_dto_1.PeriodType.ALL:
                return 'За всё время';
            default:
                return '';
        }
    }
}
exports.DateRangeHelper = DateRangeHelper;
//# sourceMappingURL=date-range.helper.js.map