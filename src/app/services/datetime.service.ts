import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DatetimeService {
  // Can I make a function available in every controller in angular?
  // https://stackoverflow.com/questions/15025979/can-i-make-a-function-available-in-every-controller-in-angular

  // 0 to 11
  months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  constructor() {}

  public Date1IsLessThanDate2(dateFrom: string, dateTo: string): boolean {
    if (!dateFrom || !dateTo) {
      return false;
    }
    const date1 = new Date(dateFrom);
    const date2 = new Date(dateTo);
    return date1.getTime() < date2.getTime();
  }

  // Unambiguous Date Format
  // https://css-tricks.com/everything-you-need-to-know-about-date-in-javascript/
  public UDF(date: Date): string {
    let udf = '';
    if (date) {
      udf =
        date.getDate().toString() +
        ' ' +
        this.months[date.getMonth()] +
        ' ' +
        date.getFullYear().toString();
    }
    return udf;
  }

  // Unambiguous DateTime Format
  public UDTF(date: Date): string {
    let udtf = '';
    if (date) {
      udtf =
        date.getDate().toString() +
        ' ' +
        this.months[date.getMonth()] +
        ' ' +
        date.getFullYear().toString() +
        ' ' +
        date.getHours().toString().padStart(2, '0') +
        ':' +
        date.getMinutes().toString().padStart(2, '0');
    }
    return udtf;
  }

  public addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  public NextMonday(): Date {
    const nextMon = new Date();
    nextMon.setDate(nextMon.getDate() - nextMon.getDay() + 8);
    return nextMon;
  }

  public DayName(day: string): string {
    switch (day) {
      case '1':
        return 'Monday';
      case '2':
        return 'Tuesday';
      case '3':
        return 'Wednesday';
      case '4':
        return 'Thursday';
      case '5':
        return 'Friday';
      case '6':
        return 'Saturday';
      case '7':
        return 'Sunday';
      default:
        return '';
    }
  }

  MeetingInterval(intervalID: number): string {
    switch (intervalID) {
      case 1:
        return 'Weekly';
      case 2:
        return 'Monthly Date';
      case 3:
        return 'Variable';
      case 4:
        return 'Monthly';
      default:
        return '';
    }
  }
}
