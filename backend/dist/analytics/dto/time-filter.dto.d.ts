export declare enum PeriodType {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    QUARTER = "quarter",
    YEAR = "year",
    ALL = "all",
    CUSTOM = "custom"
}
export declare class TimeFilterDto {
    period: PeriodType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
