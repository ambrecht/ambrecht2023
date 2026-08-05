'use client';

import React, { useEffect, useMemo, useState } from 'react';

interface SessionActivityOverviewProps {
  days?: number;
  refreshKey?: number;
}

type ApiActivityDay = {
  date: string;
  words: number;
  sessions: number;
  level: number;
};

type ApiWritingOverview = {
  range: {
    from: string;
    to: string;
    days: number;
  };
  stats: {
    words: number;
    active_days: number;
    streak_days: number;
    sessions: {
      written: number;
      total: number;
    };
  };
  days: ApiActivityDay[];
  legend: {
    min_level: number;
    max_level: number;
  };
};

type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error?: string;
      message?: string;
    };

type GridDay = ApiActivityDay & {
  dateValue: Date;
  key: string;
  inRange: boolean;
};

const WEEKDAYS = ['Mo', '', 'Mi', '', 'Fr', '', ''];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dez',
];

const buildApiUrl = (
  path: string,
  query?: Record<string, string | number | undefined>,
) => {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }
  }
  const queryString = params.toString();
  return `${path}${queryString ? `?${queryString}` : ''}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

const pluralize = (count: number, singular: string, plural: string) =>
  count === 1 ? singular : plural;

const getCellClass = (level: number) => {
  const classes = [
    'bg-[#1a1511]',
    'bg-[#6b5a38]',
    'bg-[#9a7d45]',
    'bg-[#c9a968]',
    'bg-[#f0d28b]',
  ];
  const safeLevel = Math.max(0, Math.min(level, classes.length - 1));
  return classes[safeLevel];
};

const buildGridDays = (overview: ApiWritingOverview | null) => {
  if (!overview || overview.days.length === 0) return [] as GridDay[];

  const byDay = new Map(overview.days.map((day) => [day.date, day]));
  const rangeStart = parseDateKey(overview.range.from);
  const rangeEnd = parseDateKey(overview.range.to);
  const firstGridDay = new Date(rangeStart);
  firstGridDay.setDate(rangeStart.getDate() - ((rangeStart.getDay() + 6) % 7));

  const days: GridDay[] = [];
  for (
    let date = new Date(firstGridDay);
    date <= rangeEnd;
    date.setDate(date.getDate() + 1)
  ) {
    const dateValue = new Date(date);
    const key = toDateKey(dateValue);
    const activity = byDay.get(key) ?? {
      date: key,
      words: 0,
      sessions: 0,
      level: 0,
    };
    days.push({
      ...activity,
      dateValue,
      key,
      inRange: dateValue >= rangeStart && dateValue <= rangeEnd,
    });
  }

  return days;
};

export function SessionActivityOverview({
  days = 365,
  refreshKey = 0,
}: SessionActivityOverviewProps) {
  const [overview, setOverview] = useState<ApiWritingOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 10000);
    setIsLoading(true);
    setError(null);

    fetch(buildApiUrl('/api/sessions/writing-overview', { days }), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        const json = (await response.json()) as ApiResponse<ApiWritingOverview>;
        if (!response.ok || !json.success) {
          throw new Error(
            (!json.success && (json.message || json.error)) ||
              `HTTP ${response.status}: Schreibaktivitaet konnte nicht geladen werden.`,
          );
        }
        setOverview(json.data);
      })
      .catch((err) => {
        if ((err as { name?: string }).name === 'AbortError' && !timedOut) return;
        setError(
          timedOut
            ? 'Schreibaktivitaet braucht zu lange. Bitte gleich erneut versuchen.'
            : err instanceof Error
            ? err.message
            : 'Schreibaktivitaet konnte nicht geladen werden.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted || timedOut) {
          setIsLoading(false);
        }
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [days, refreshKey]);

  const { gridDays, monthLabels, weekCount } = useMemo(() => {
    const activityDays = buildGridDays(overview);
    const labels: Array<{ label: string; column: number }> = [];
    let lastMonth = -1;

    activityDays.forEach((day, index) => {
      if (
        day.inRange &&
        day.dateValue.getDate() <= 7 &&
        day.dateValue.getMonth() !== lastMonth
      ) {
        labels.push({
          label: MONTHS[day.dateValue.getMonth()],
          column: Math.floor(index / 7) + 1,
        });
        lastMonth = day.dateValue.getMonth();
      }
    });

    return {
      gridDays: activityDays,
      monthLabels: labels,
      weekCount: Math.max(Math.ceil(days / 7), Math.ceil(activityDays.length / 7), 1),
    };
  }, [days, overview]);

  const stats = overview?.stats;
  const sessionLabel = stats
    ? `${stats.sessions.written.toLocaleString('de-DE')} von ${stats.sessions.total.toLocaleString(
        'de-DE',
      )}`
    : '...';

  return (
    <section
      className="mb-8 rounded-lg border border-[#2f2822] bg-[#100d0a] p-4"
      aria-labelledby="session-activity-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#cbbfb0]">
            Schreibaktivitaet
          </p>
          <h2
            id="session-activity-heading"
            className="mt-1 text-xl font-semibold text-[#fdfbf7]"
          >
            Wann du geschrieben hast
          </h2>
          {error && (
            <p className="mt-2 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[#8f8174]">Woerter</dt>
            <dd className="font-semibold text-[#f7f4ed]">
              {stats ? stats.words.toLocaleString('de-DE') : '...'}
            </dd>
          </div>
          <div>
            <dt className="text-[#8f8174]">Aktive Tage</dt>
            <dd className="font-semibold text-[#f7f4ed]">
              {stats ? stats.active_days : '...'}
            </dd>
          </div>
          <div>
            <dt className="text-[#8f8174]">Serie</dt>
            <dd className="font-semibold text-[#f7f4ed]">
              {stats
                ? `${stats.streak_days} ${pluralize(
                    stats.streak_days,
                    'Tag',
                    'Tage',
                  )}`
                : '...'}
            </dd>
          </div>
          <div>
            <dt className="text-[#8f8174]">Sessions</dt>
            <dd className="font-semibold text-[#f7f4ed]">{sessionLabel}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div
          className="grid min-w-[740px] gap-1"
          style={{
            gridTemplateColumns: `28px repeat(${weekCount}, minmax(10px, 1fr))`,
          }}
        >
          <div aria-hidden="true" />
          <div
            className="grid text-[11px] text-[#8f8174]"
            style={{
              gridColumn: `2 / span ${weekCount}`,
              gridTemplateColumns: `repeat(${weekCount}, minmax(10px, 1fr))`,
            }}
          >
            {monthLabels.map((month) => (
              <span
                key={`${month.label}-${month.column}`}
                style={{ gridColumnStart: month.column }}
              >
                {month.label}
              </span>
            ))}
          </div>

          <div className="grid grid-rows-7 gap-1 text-[11px] leading-3 text-[#8f8174]">
            {WEEKDAYS.map((weekday, index) => (
              <span key={`${weekday}-${index}`} className="h-3">
                {weekday}
              </span>
            ))}
          </div>

          <div
            className="grid grid-flow-col grid-rows-7 gap-1"
            style={{ gridColumn: `2 / span ${weekCount}` }}
          >
            {isLoading && gridDays.length === 0
              ? Array.from({ length: weekCount * 7 }).map((_, index) => (
                  <span
                    key={`loading-${index}`}
                    className="h-3 rounded-[3px] border border-[#2f2822] bg-[#1a1511]"
                  />
                ))
              : gridDays.map((day) => {
                  const title =
                    day.words > 0
                      ? `${formatDate(day.dateValue)}: ${day.words.toLocaleString(
                          'de-DE',
                        )} Woerter in ${day.sessions} ${pluralize(
                          day.sessions,
                          'Session',
                          'Sessions',
                        )}`
                      : `${formatDate(day.dateValue)}: nicht geschrieben`;

                  return (
                    <span
                      key={day.key}
                      title={title}
                      aria-label={title}
                      className={`h-3 rounded-[3px] border border-[#2f2822] ${getCellClass(
                        day.inRange ? day.level : 0,
                      )} ${day.inRange ? '' : 'opacity-30'}`}
                    />
                  );
                })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[#8f8174]">
        <span>
          Letzte {overview?.range.days ?? days} Tage, direkt aus der Schreibaktivitaets-API
        </span>
        <div className="flex items-center gap-1">
          <span>Weniger</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`h-3 w-3 rounded-[3px] border border-[#2f2822] ${getCellClass(
                level,
              )}`}
            />
          ))}
          <span>Mehr</span>
        </div>
      </div>
    </section>
  );
}
