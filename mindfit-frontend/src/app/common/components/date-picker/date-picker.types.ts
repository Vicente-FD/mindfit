export interface DateRangeValue {
  start: string;
  end: string;
}

export type DatePickerSingleValue = string | null;
export type DatePickerRangeValue = DateRangeValue | null;
export type DatePickerMonthValue = string | null;

export type DatePickerMode = 'single' | 'range';
export type DatePickerView = 'day' | 'month';
