import type { DayInfo } from '../lib/api';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export interface AvailabilityCalendarProps {
  days: DayInfo[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export function AvailabilityCalendar({
  days,
  selectedDate,
  onSelect,
}: AvailabilityCalendarProps) {
  const rows: DayInfo[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));

  return (
    <div className="cal">
      <div className="cal__weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w} className="cal__weekday">
            {w}
          </span>
        ))}
      </div>

      {rows.map((row, r) => (
        <div className="cal__row" key={r}>
          {row.map((d) => {
            const closed = d.closed;
            const fill = closed ? 1 : Math.min(1, Math.max(0, d.fill ?? 0));
            const num = d.date.slice(8, 10);
            const date = new Date(`${d.date}T00:00:00`);
            const weekday = capitalize(date.toLocaleDateString('ru-RU', { weekday: 'short' }));
            const month = capitalize(date.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''));
            const selected = selectedDate === d.date;
            const pct = Math.round(fill * 100);

            return (
              <button
                key={d.date}
                type="button"
                className={[
                  'cal-day',
                  closed ? 'cal-day--closed' : '',
                  selected ? 'cal-day--selected' : '',
                  d.free ? 'cal-day--free' : '',
                ].join(' ')}
                disabled={closed}
                onClick={() => onSelect(d.date)}
                aria-label={`${d.label}${closed ? ', мастер не работает' : `, ${pct}% дня занято`}`}
                title={closed ? 'Мастер не работает' : `Занято ${pct}% рабочего времени`}
              >
                {!closed && (
                  <span
                    className="cal-day__fill"
                    style={{ height: `${pct}%` }}
                    aria-hidden="true"
                  />
                )}
                <span className="cal-day__top">
                  <span className="cal-day__wd">{weekday}</span>
                  <span className="cal-day__num">{num}</span>
                </span>
                <span className="cal-day__month">{month}</span>
                <span className="cal-day__status">
                  {closed
                    ? d.closedReason === 'weekend'
                      ? 'выходной'
                      : 'не работает'
                    : d.free
                      ? d.slotsCount > 0
                        ? `${d.slotsCount} окна`
                        : 'свободно'
                      : 'нет окон'}
                </span>
              </button>
            );
          })}
        </div>
      ))}

      <div className="cal__legend">
        <span className="cal__legend-item">
          <span className="cal__legend-swatch cal__legend-swatch--open" />
          свободно
        </span>
        <span className="cal__legend-item">
          <span className="cal__legend-swatch cal__legend-swatch--busy" />
          частично занято
        </span>
        <span className="cal__legend-item">
          <span className="cal__legend-swatch cal__legend-swatch--closed" />
          выходной / не работает
        </span>
      </div>
    </div>
  );
}
