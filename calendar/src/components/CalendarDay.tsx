import { motion } from 'framer-motion';
import type { CalendarDay as CalendarDayType, JournalEntry } from '../types';

interface CalendarDayProps {
  day: CalendarDayType;
  onEntryClick: (entry: JournalEntry) => void;
}

const moodColors = {
  happy: 'bg-green-100 border-green-300',
  sad: 'bg-blue-100 border-blue-300',
  neutral: 'bg-gray-100 border-gray-300',
  excited: 'bg-yellow-100 border-yellow-300',
  anxious: 'bg-red-100 border-red-300'
};

export const CalendarDay = ({ day, onEntryClick }: CalendarDayProps) => {
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const isToday = formatDate(day.date) === formatDate(new Date());

  return (
    <motion.div
      className={`min-h-24 p-2 border border-gray-200 ${
        day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`text-sm font-medium mb-1 ${
        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
      } ${isToday ? 'text-blue-600' : ''}`}>
        {day.date.getDate()}
      </div>
      
      <div className="space-y-1">
        {day.entries.map((entry) => (
          <motion.button
            key={entry.id}
            onClick={() => onEntryClick(entry)}
            className={`w-full text-left p-1 rounded text-xs border ${
              moodColors[entry.mood || 'neutral']
            } hover:shadow-sm transition-shadow`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-medium truncate">{entry.title}</div>
            <div className="text-gray-600 truncate">{entry.content}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};