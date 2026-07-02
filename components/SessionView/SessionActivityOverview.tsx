'use client';

import React, { useMemo } from 'react';
import type { Session } from './types';

interface SessionActivityOverviewProps {
  sessions: Session[];
  totalSessions?: number;
}

type DayActivity = {
  date: Date;
  key: string;
  words: number;
  letters: number;
  sessions: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
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

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

const getLevel = (words: number, maxWords: number) => {
  if (words <= 0 || maxWords <= 0) return 0;
  const ratio = words / maxWords;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.45) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
};

const getCellClass = (level: number) => {
  const classes = [
    'bg-[#1a1511]',
    'bg-[#6b5a38]',
    'bg-[#9a7d45]',
    'bg-[#c9a968]',
    'bg-[#f0d28b]',
  ];
  return classes[level] ?? classes[0];
};

const buildActivityDays = (sessions: Session[]) => {
  const today = startOfDay(new Date());
  const start = new Date(today);
  start.setDate(start.getDate() - 364);

  const byDay = new Map<string, Omit<DayActivity, 'date' | 'key'>>();
  for (const session of sessions) {
    const createdAt = new Date(session.created_at);
    if (Number.isNaN(createdAt.getTime())) continue;

    const day = startOfDay(createdAt);
    if (day < start || day > today) continue;

    const key = toDateKey(day);
    const current = byDay.get(key) ?? { words: 0, letters: 0, sessions: 0 };
    byDay.set(key, {
      words: current.words + (session.word_count ?? 0),
      letters: current.letters + (session.letter_count ?? 0),
      sessions: current.sessions + 1,
    });
  }

  const firstGridDay = new Date(start);
  firstGridDay.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const days: DayActivity[] = [];
  for (let date = new Date(firstGridDay); date <= today; date.setDate(date.getDate() + 1)) {
    const day = new Date(date);
    const key = toDateKey(day);
    const activity = byDay.get(key) ?? { words: 0, letters: 0, sessions: 0 };
    days.push({ date: day, key, ...activity });
  }

  return days;
};

const computeCurrentStreak = (days: DayActivity[]) => {
  let streak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].words <= 0) break;
    streak += 1;
  }
  return streak;
};

export function SessionActivityOverview({
  sessions,
  totalSessions,
}: SessionActivityOverviewProps) {
  const { days, maxWords, totals, monthLabels, currentStreak } = useMemo(() => {
    const activityDays = buildActivityDays(sessions);
    const activeDays = activityDays.filter((day) => day.words > 0);
    const max = activeDays.reduce((highest, day) => Math.max(highest, day.words), 0);
    const words = activeDays.reduce((sum, day) => sum + day.words, 0);
    const letters = activeDays.reduce((sum, day) => sum + day.letters, 0);

    const labels: Array<{ label: string; column: number }> = [];
    let lastMonth = -1;
    activityDays.forEach((day, index) => {
      if (day.date.getDate() <= 7 && day.date.getMonth() !== lastMonth) {
        labels.push({
          label: MONTHS[day.date.getMonth()],
          column: Math.floor(index / 7) + 1,
        });
        lastMonth = day.date.getMonth();
      }
    });

    return {
      days: activityDays,
      maxWords: max,
      monthLabels: labels,
      currentStreak: computeCurrentStreak(activityDays),
      totals: {
        words,
        letters,
        activeDays: activeDays.length,
        loadedSessions: sessions.length,
      },
    };
  }, [sessions]);

  const weekCount = Math.ceil(days.length / 7);
  const loadedLabel =
    totalSessions && totalSessions > totals.loadedSessions
      ? `${totals.loadedSessions} von ${totalSessions}`
      : String(totals.loadedSessions);

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
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[#8f8174]">Woerter</dt>
            <dd className="font-semibold text-[#f7f4ed]">
              {totals.words.toLocaleString('de-DE')}
            </dd>
          </div>
          <div>
            <dt className="text-[#8f8174]">Aktive Tage</dt>
            <dd className="font-semibold text-[#f7f4ed]">{totals.activeDays}</dd>
          </div>
          <div>
            <dt className="text-[#8f8174]">Serie</dt>
            <dd className="font-semibold text-[#f7f4ed]">
              {currentStreak} {pluralize(currentStreak, 'Tag', 'Tage')}
            </dd>
          </div>
          <div>
            <dt className="text-[#8f8174]">Sessions</dt>
            <dd className="font-semibold text-[#f7f4ed]">{loadedLabel}</dd>
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
            {days.map((day) => {
              const level = getLevel(day.words, maxWords);
              const title =
                day.words > 0
                  ? `${formatDate(day.date)}: ${day.words.toLocaleString(
                      'de-DE',
                    )} Woerter in ${day.sessions} ${pluralize(
                      day.sessions,
                      'Session',
                      'Sessions',
                    )}`
                  : `${formatDate(day.date)}: nicht geschrieben`;

              return (
                <span
                  key={day.key}
                  title={title}
                  aria-label={title}
                  className={`h-3 rounded-[3px] border border-[#2f2822] ${getCellClass(
                    level,
                  )}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[#8f8174]">
        <span>Letzte 365 Tage, basierend auf geladenen Sessions</span>
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
