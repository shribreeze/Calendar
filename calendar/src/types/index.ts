export interface JournalEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious';
  tags?: string[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  days: CalendarDay[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  entries: JournalEntry[];
}