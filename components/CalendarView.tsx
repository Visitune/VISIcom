
import React from 'react';
import { Contact, Activity } from '../types';
import { Calendar, ChevronLeft, ChevronRight, CheckSquare, Phone, Mail, Users, Clock } from 'lucide-react';

interface CalendarViewProps {
  contacts: Contact[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ contacts }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  // Helper to get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get all activities with due dates
  const events = contacts.flatMap(c => 
    c.activities
      .filter(a => a.dueDate)
      .map(a => ({
        ...a,
        contactName: `${c.firstName} ${c.lastName}`,
        company: c.company,
        dueDateObj: new Date(a.dueDate!)
      }))
  );

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate); // 0 = Sunday
  const startingDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-slate-50/50 min-h-[120px] border border-slate-100"></div>);
    }

    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateToCheck = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const isToday = dateToCheck.toDateString() === today.toDateString();
      
      const dayEvents = events.filter(e => 
        e.dueDateObj.getDate() === d && 
        e.dueDateObj.getMonth() === currentDate.getMonth() &&
        e.dueDateObj.getFullYear() === currentDate.getFullYear()
      );

      days.push(
        <div key={d} className={`min-h-[120px] border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50 ${isToday ? 'bg-indigo-50/30' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
              {d}
            </span>
            {dayEvents.length > 0 && <span className="text-xs text-slate-400">{dayEvents.length} items</span>}
          </div>
          
          <div className="space-y-1">
            {dayEvents.map(event => (
              <div key={event.id} className={`text-[10px] p-1.5 rounded border truncate flex items-center gap-1 ${
                event.isDone ? 'bg-slate-100 text-slate-400 border-slate-200 line-through' :
                event.type === 'call' ? 'bg-green-50 text-green-700 border-green-100' :
                event.type === 'meeting' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                {event.type === 'call' && <Phone size={10} />}
                {event.type === 'email' && <Mail size={10} />}
                {event.type === 'meeting' && <Users size={10} />}
                {event.type === 'task' && <CheckSquare size={10} />}
                <span>{event.description}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const renderMobileAgenda = () => {
     // Get all events for current month, sorted by date
     const monthEvents = events.filter(e => 
        e.dueDateObj.getMonth() === currentDate.getMonth() &&
        e.dueDateObj.getFullYear() === currentDate.getFullYear()
     ).sort((a,b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());

     if(monthEvents.length === 0) return (
         <div className="text-center text-slate-400 mt-10 p-4 flex flex-col items-center">
             <Calendar size={48} className="opacity-20 mb-2"/>
             <p>Aucun événement pour ce mois.</p>
         </div>
     );

     return monthEvents.map(event => (
         <div key={event.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
             <div className={`flex flex-col items-center justify-center rounded-lg p-2 min-w-[3.5rem] h-14 ${
                 event.dueDateObj.getDate() === today.getDate() && event.dueDateObj.getMonth() === today.getMonth() 
                 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
             }`}>
                 <span className="text-[10px] font-bold uppercase">{event.dueDateObj.toLocaleString('default', { month: 'short' })}</span>
                 <span className="text-xl font-bold leading-none">{event.dueDateObj.getDate()}</span>
             </div>
             <div className="flex-1 min-w-0">
                 <h4 className={`font-bold text-sm truncate ${event.isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {event.description}
                 </h4>
                 <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 truncate">
                    <Clock size={12} />
                    <span>{event.dueDateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span>•</span>
                    <span className="truncate">{event.contactName}</span>
                 </div>
                 <div className="mt-2 flex">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded border uppercase font-semibold ${
                        event.type === 'call' ? 'bg-green-50 border-green-100 text-green-700' : 
                        event.type === 'meeting' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                        'bg-blue-50 border-blue-100 text-blue-700'
                    }`}>
                        {event.type === 'call' && <Phone size={10} />}
                        {event.type === 'meeting' && <Users size={10} />}
                        {event.type}
                    </span>
                 </div>
             </div>
         </div>
     ));
  }

  return (
    <div className="h-full p-4 md:p-8 flex flex-col overflow-hidden bg-slate-50">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Calendar size={28} className="text-indigo-600 md:w-8 md:h-8" />
            Calendrier
        </h1>
        <div className="flex items-center space-x-4 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-full md:w-auto justify-between md:justify-start">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                <ChevronLeft size={20} />
            </button>
            <span className="font-bold text-slate-800 min-w-[120px] text-center capitalize">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:flex flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
                    {day}
                </div>
            ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-7 flex-1 overflow-y-auto auto-rows-fr">
            {renderCalendarDays()}
        </div>
      </div>

      {/* Mobile Agenda View */}
      <div className="md:hidden flex-1 overflow-y-auto space-y-4 pb-20 pr-1">
          {renderMobileAgenda()}
      </div>
    </div>
  );
};

export default CalendarView;
