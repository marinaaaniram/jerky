import { PeriodType } from '../dto/time-filter.dto';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class DateRangeHelper {
  static getDateRange(period: PeriodType, startDate?: string, endDate?: string): DateRange {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (period) {
      case PeriodType.DAY:
        return {
          startDate: new Date(now),
          endDate: new Date(now),
        };

      case PeriodType.WEEK:
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return { startDate: weekStart, endDate: weekEnd };

      case PeriodType.MONTH:
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };

      case PeriodType.QUARTER:
        const quarter = Math.floor(now.getMonth() / 3);
        return {
          startDate: new Date(now.getFullYear(), quarter * 3, 1),
          endDate: new Date(now.getFullYear(), quarter * 3 + 3, 0),
        };

      case PeriodType.YEAR:
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31),
        };

      case PeriodType.ALL:
        return {
          startDate: new Date('2020-01-01'),
          endDate: new Date(),
        };

      case PeriodType.CUSTOM:
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

  static formatPeriodLabel(period: PeriodType, date?: Date): string {
    const d = date || new Date();
    switch (period) {
      case PeriodType.DAY:
        return d.toLocaleDateString('ru-RU');
      case PeriodType.WEEK:
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1));
        return `Неделя с ${weekStart.toLocaleDateString('ru-RU')}`;
      case PeriodType.MONTH:
        return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      case PeriodType.QUARTER:
        const quarter = Math.floor(d.getMonth() / 3) + 1;
        return `Q${quarter} ${d.getFullYear()}`;
      case PeriodType.YEAR:
        return `${d.getFullYear()}`;
      case PeriodType.ALL:
        return 'За всё время';
      default:
        return '';
    }
  }
}
