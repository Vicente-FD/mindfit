import {
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  input,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import {
  DatePickerMode,
  DatePickerView,
  DateRangeValue,
} from './date-picker.types';
import {
  addMonths,
  buildRangePresets,
  compareIso,
  formatDisplayDate,
  formatDisplayMonth,
  formatRangeDisplay,
  getCalendarDays,
  isInRange,
  isSameDay,
  MONTH_LABELS,
  parseIsoDate,
  RangePreset,
  startOfMonth,
  toIsoDate,
  WEEKDAY_LABELS,
} from './date-picker.utils';

let nextId = 0;

@Component({
  selector: 'mindfit-date-picker',
  imports: [LucideAngularModule, NgClass],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MindfitDatePickerComponent),
      multi: true,
    },
  ],
})
export class MindfitDatePickerComponent implements ControlValueAccessor {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly mode = input<DatePickerMode>('single');
  readonly view = input<DatePickerView>('day');
  readonly label = input<string | undefined>(undefined);
  readonly placeholder = input('Seleccionar fecha');
  readonly inputId = `mindfit-dp-${++nextId}`;

  readonly isOpen = signal(false);
  readonly isMobile = signal(false);
  readonly viewMonth = signal(startOfMonth(new Date()));
  readonly viewYear = signal(new Date().getFullYear());

  readonly rangePresets = buildRangePresets();

  private singleValue: string | null = null;
  private rangeValue: DateRangeValue | null = null;
  private monthValue: string | null = null;

  private rangeDraftStart: string | null = null;
  private rangeDraftEnd: string | null = null;

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};
  readonly isDisabled = signal(false);

  readonly displayText = computed(() => {
    if (this.view() === 'month') {
      return this.monthValue
        ? formatDisplayMonth(this.monthValue)
        : this.placeholder();
    }
    if (this.mode() === 'range') {
      const r = this.rangeValue;
      if (r?.start && r?.end) return formatRangeDisplay(r);
      if (this.rangeDraftStart && !this.rangeDraftEnd) {
        return `${formatDisplayDate(this.rangeDraftStart)} – …`;
      }
      return this.placeholder();
    }
    return this.singleValue
      ? formatDisplayDate(this.singleValue)
      : this.placeholder();
  });

  readonly hasValue = computed(() => {
    if (this.view() === 'month') return !!this.monthValue;
    if (this.mode() === 'range') {
      return !!(this.rangeValue?.start && this.rangeValue?.end);
    }
    return !!this.singleValue;
  });

  readonly calendarDays = computed(() => getCalendarDays(this.viewMonth()));

  readonly monthTitle = computed(() => {
    const d = this.viewMonth();
    return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  });

  readonly yearTitle = computed(() => String(this.viewYear()));

  constructor() {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(max-width: 639px)');
      const update = () => this.isMobile.set(mq.matches);
      update();
      mq.addEventListener('change', update);
      this.destroyRef.onDestroy(() => mq.removeEventListener('change', update));
    }
  }

  writeValue(value: unknown): void {
    if (this.view() === 'month') {
      if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
        this.monthValue = value;
        const [y] = value.split('-').map(Number);
        this.viewYear.set(y);
      } else {
        this.monthValue = null;
      }
      return;
    }

    if (this.mode() === 'range') {
      const r = value as DateRangeValue | null;
      this.rangeValue =
        r?.start && r?.end ? { start: r.start, end: r.end } : null;
      this.rangeDraftStart = this.rangeValue?.start ?? null;
      this.rangeDraftEnd = this.rangeValue?.end ?? null;
      if (this.rangeValue?.start) {
        this.viewMonth.set(startOfMonth(parseIsoDate(this.rangeValue.start)));
      }
      return;
    }

    if (typeof value === 'string' && value.length === 0) {
      this.singleValue = null;
    } else {
      this.singleValue =
        typeof value === 'string' && value.length >= 10
          ? value.slice(0, 10)
          : null;
    }
    if (this.singleValue) {
      this.viewMonth.set(startOfMonth(parseIsoDate(this.singleValue)));
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isDisabled()) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.syncDraftFromValue();
    this.isOpen.set(true);
    this.onTouched();
  }

  close(): void {
    this.isOpen.set(false);
    this.syncDraftFromValue();
  }

  clear(event: Event): void {
    event.stopPropagation();
    if (this.view() === 'month') {
      this.monthValue = null;
      this.onChange(null);
    } else if (this.mode() === 'range') {
      this.rangeValue = null;
      this.rangeDraftStart = null;
      this.rangeDraftEnd = null;
      this.onChange(null);
    } else {
      this.singleValue = null;
      this.onChange(null);
    }
    this.onTouched();
    this.close();
  }

  prevMonth(): void {
    this.viewMonth.update((m) => addMonths(m, -1));
  }

  nextMonth(): void {
    this.viewMonth.update((m) => addMonths(m, 1));
  }

  prevYear(): void {
    this.viewYear.update((y) => y - 1);
  }

  nextYear(): void {
    this.viewYear.update((y) => y + 1);
  }

  selectMonth(monthIndex: number): void {
    const ym = `${this.viewYear()}-${String(monthIndex + 1).padStart(2, '0')}`;
    this.monthValue = ym;
    this.onChange(ym);
    this.onTouched();
    this.close();
  }

  selectDay(day: Date): void {
    const iso = toIsoDate(day);

    if (this.mode() === 'range') {
      if (!this.rangeDraftStart || (this.rangeDraftStart && this.rangeDraftEnd)) {
        this.rangeDraftStart = iso;
        this.rangeDraftEnd = null;
        return;
      }
      let start = this.rangeDraftStart;
      let end = iso;
      if (compareIso(end, start) < 0) {
        [start, end] = [end, start];
      }
      this.rangeDraftStart = start;
      this.rangeDraftEnd = end;
      this.rangeValue = { start, end };
      this.onChange(this.rangeValue);
      this.onTouched();
      this.close();
      return;
    }

    this.singleValue = iso;
    this.onChange(iso);
    this.onTouched();
    this.close();
  }

  applyPreset(preset: RangePreset): void {
    this.rangeValue = { ...preset.range };
    this.rangeDraftStart = preset.range.start;
    this.rangeDraftEnd = preset.range.end;
    this.viewMonth.set(startOfMonth(parseIsoDate(preset.range.start)));
    this.onChange(this.rangeValue);
    this.onTouched();
    this.close();
  }

  dayClasses(day: Date): Record<string, boolean> {
    const iso = toIsoDate(day);
    const inCurrentMonth = day.getMonth() === this.viewMonth().getMonth();
    const today = isSameDay(day, new Date());

    let selected = false;
    let inRange = false;
    let rangeStart = false;
    let rangeEnd = false;

    if (this.mode() === 'range') {
      const start = this.rangeDraftStart;
      const end = this.rangeDraftEnd;
      if (start && end) {
        rangeStart = iso === start;
        rangeEnd = iso === end;
        inRange = isInRange(iso, start, end);
        selected = rangeStart || rangeEnd;
      } else if (start) {
        selected = iso === start;
        rangeStart = selected;
      }
    } else if (this.singleValue) {
      selected = iso === this.singleValue;
    }

    return {
      'mdp-day': true,
      'mdp-day--outside': !inCurrentMonth,
      'mdp-day--today': today,
      'mdp-day--selected': selected && this.mode() !== 'range',
      'mdp-day--range': inRange && !selected,
      'mdp-day--range-start': rangeStart,
      'mdp-day--range-end': rangeEnd,
    };
  }

  isMonthSelected(index: number): boolean {
    if (!this.monthValue) return false;
    const [y, m] = this.monthValue.split('-').map(Number);
    return y === this.viewYear() && m === index + 1;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const el = this.host.nativeElement;
    if (!el.contains(event.target as Node)) {
      this.close();
    }
  }

  private syncDraftFromValue(): void {
    if (this.mode() === 'range') {
      this.rangeDraftStart = this.rangeValue?.start ?? null;
      this.rangeDraftEnd = this.rangeValue?.end ?? null;
    }
  }

  dayTrackKey(day: Date): string {
    return toIsoDate(day);
  }

  protected readonly weekdayLabels = WEEKDAY_LABELS;
  protected readonly monthLabels = MONTH_LABELS;
}
