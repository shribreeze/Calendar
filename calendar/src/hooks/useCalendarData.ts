import { useState, useCallback, useMemo } from 'react';
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

// Helper functions without date-fns
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const getMonthName = (month: number) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month];
};

export const useCalendarData = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const generateMonth = useCallback((year: number, month: number): CalendarMonth => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    
    const days: CalendarDay[] = [];
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date,
        isCurrentMonth: false,
        entries: mockEntries.filter(entry => formatDate(entry.date) === formatDate(date))
      });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        entries: mockEntries.filter(entry => formatDate(entry.date) === formatDate(date))
      });
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        entries: mockEntries.filter(entry => formatDate(entry.date) === formatDate(date))
      });
    }
    
    return { year, month, days };
  }, []);

  const getMonthsRange = useCallback((centerDate: Date, range: number = 3): CalendarMonth[] => {
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