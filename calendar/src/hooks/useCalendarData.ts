import { useState, useCallback, useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth } from 'date-fns';
import { CalendarMonth, CalendarDay, JournalEntry } from '../types';

// Mock journal entries
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date(2024, 8, 15),
    title: 'Great day at work',
    content: 'Had an amazing presentation today. The team loved the new features we built.',
    mood: 'happy',
    tags: ['work', 'success']
  },
  {
    id: '2',
    date: new Date(2024, 8, 20),
    title: 'Weekend vibes',
    content: 'Spent the day hiking with friends. The weather was perfect and the views were incredible.',
    mood: 'excited',
    tags: ['nature', 'friends']
  },
  {
    id: '3',
    date: new Date(2024, 9, 5),
    title: 'Reflection time',
    content: 'Taking some time to think about my goals for the next quarter. Feeling optimistic about the future.',
    mood: 'neutral',
    tags: ['reflection', 'goals']
  }
];

export const useCalendarData = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const generateMonth = useCallback((year: number, month: number): CalendarMonth => {
    const monthStart = startOfMonth(new Date(year, month));
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, monthStart),
      entries: mockEntries.filter(entry => 
        format(entry.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )
    }));

    return { year, month, days };
  }, []);

  const getMonthsRange = useCallback((centerDate: Date, range: number = 6): CalendarMonth[] => {
    const months: CalendarMonth[] = [];
    const centerYear = centerDate.getFullYear();
    const centerMonth = centerDate.getMonth();

    for (let i = -range; i <= range; i++) {
      const targetDate = new Date(centerYear, centerMonth + i);
      months.push(generateMonth(targetDate.getFullYear(), targetDate.getMonth()));
    }

    return months;
  }, [generateMonth]);

  const months = useMemo(() => getMonthsRange(currentDate), [currentDate, getMonthsRange]);

  return {
    months,
    currentDate,
    setCurrentDate,
    generateMonth,
    getMonthsRange
  };
};