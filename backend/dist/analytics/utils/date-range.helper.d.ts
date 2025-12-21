import { PeriodType } from '../dto/time-filter.dto';
export interface DateRange {
    startDate: Date;
    endDate: Date;
}
export declare class DateRangeHelper {
    static getDateRange(period: PeriodType, startDate?: string, endDate?: string): DateRange;
    static formatPeriodLabel(period: PeriodType, date?: Date): string;
}
