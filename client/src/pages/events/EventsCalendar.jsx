import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getEvents } from '../../store/events/eventsSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock, faMapMarkerAlt, faDollarSign, faTicketAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function EventsCalendar() {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.events);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(getEvents({ limit: 100 }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05213C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar events...</p>
        </div>
      </div>
    );
  }

  // Get events for the selected month
  const getEventsForMonth = () => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() + 1 === currentMonth && eventDate.getFullYear() === currentYear;
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Get first event of the month for initial display
  const getFirstEventOfMonth = () => {
    const monthEvents = getEventsForMonth();
    if (monthEvents.length === 0) return null;
   
    // Sort by date and return the first one
    return monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  };

  // Generate days for the current month
  const generateDays = () => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday start
   
    // Add empty days for the beginning of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
   
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }
   
    return days;
  };

  const monthEvents = getEventsForMonth();
  const firstEvent = getFirstEventOfMonth();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() &&
           currentMonth === today.getMonth() + 1 &&
           currentYear === today.getFullYear();
  };
  const hasEvent = (day) => {
    if (!day) return false;
    const date = new Date(currentYear, currentMonth - 1, day);
    return getEventsForDate(date).length > 0;
  };
  const handleDateClick = (day) => {
    if (!day) return;
    const date = new Date(currentYear, currentMonth - 1, day);
    setSelectedDate(date);
  };
  const handleMonthChange = (month) => {
    setCurrentMonth(month);
    setSelectedDate(null);
  };

  const handleMonthNavigation = (increment) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#05213C] mb-2">Events Calendar</h1>
          <p className="text-gray-600">Browse and discover upcoming events</p>
        </div>
        <div className="calendar-container bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="calendar flex flex-col lg:flex-row">
            {/* Left Column - Event Details */}
            <div className="lg:w-2/5 bg-[#05213C] text-white p-8">
              <div className="content h-full flex flex-col">
                <h1 className="date text-3xl font-light mb-4 uppercase text-white/90">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
                    : today.toLocaleDateString('en-US', { weekday: 'long' })
                  }
                  <span className="block text-xl mt-2 opacity-90">
                    {selectedDate
                      ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                      : today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                    }
                  </span>
                </h1>
                <div className="events-details flex-1">
                  {selectedDate ? (
                    selectedDateEvents.length > 0 ? (
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 text-white/70">
                          Events on {selectedDate.toLocaleDateString()}
                        </h3>
                        {selectedDateEvents.map((event, index) => (
                          <div key={event._id} className="event-card bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-2">{event.title}</h4>
                            <p className="text-white/80 text-sm mb-3 line-clamp-2">
                              {event.description}
                            </p>
                            <div className="event-meta space-y-2 text-sm">
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-2 opacity-70" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2 opacity-70" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center">
                                <FontAwesomeIcon
                                  icon={event.price > 0 ? faDollarSign : faTicketAlt}
                                  className="w-4 h-4 mr-2 opacity-70"
                                />
                                <span>{event.price > 0 ? `$${event.price}` : 'Free'}</span>
                              </div>
                            </div>
                            {selectedDateEvents.length > 1 && index < selectedDateEvents.length - 1 && (
                              <hr className="my-4 border-white/20" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FontAwesomeIcon icon={faCalendar} className="text-4xl mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2 text-white/70">No Events</h3>
                        <p className="text-white/70">No events scheduled for this date.</p>
                      </div>
                    )
                  ) : firstEvent ? (
                    <div className="featured-event">
                      <h3 className="text-xl font-semibold mb-4">Featured Event</h3>
                      <div className="event-card bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <h4 className="font-bold text-lg mb-2">{firstEvent.title}</h4>
                        <p className="text-white/80 text-sm mb-3">
                          {firstEvent.description.substring(0, 120)}...
                        </p>
                        <div className="event-meta space-y-2 text-sm">
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-2 opacity-70" />
                            <span>
                              {new Date(firstEvent.date).toLocaleDateString()} at {firstEvent.time}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2 opacity-70" />
                            <span>{firstEvent.location}</span>
                          </div>
                          <div className="flex items-center">
                            <FontAwesomeIcon
                              icon={firstEvent.price > 0 ? faDollarSign : faTicketAlt}
                              className="w-4 h-4 mr-2 opacity-70"
                            />
                            <span>{firstEvent.price > 0 ? `$${firstEvent.price}` : 'Free'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FontAwesomeIcon icon={faCalendar} className="text-4xl mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2 text-white/70">No Events This Month</h3>
                      <p className="text-white/70">Check back later for upcoming events.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right Column - Calendar */}
            <div className="lg:w-3/5 p-8">
              <div className="content">
                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-8">
                  <button
                    onClick={() => handleMonthNavigation(-1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5 text-[#05213C]" />
                  </button>
                  <h2 className="text-3xl font-light text-[#05213C]">{`${months[currentMonth - 1]} ${currentYear}`}</h2>
                  <button
                    onClick={() => handleMonthNavigation(1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5 text-[#05213C]" />
                  </button>
                </div>
                {/* Weekdays */}
                <ul className="weekday grid grid-cols-7 gap-2 mb-4">
                  {weekdays.map(day => (
                    <li key={day} className="text-center">
                      <span className="text-xs font-medium text-[#05213C] uppercase tracking-wider">
                        {day}
                      </span>
                    </li>
                  ))}
                </ul>
                {/* Days Grid */}
                <ul className="days grid grid-cols-7 gap-2">
                  {generateDays().map((day, index) => (
                    <li key={index} className="text-center relative">
                      {day ? (
                        <button
                          onClick={() => handleDateClick(day)}
                          className={`
                            w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 relative
                            ${isToday(day)
                              ? 'bg-[#05213C] text-white shadow-lg transform scale-105'
                              : hasEvent(day)
                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                            }
                            ${selectedDate && selectedDate.getDate() === day ? 'ring-2 ring-[#05213C] ring-offset-2' : ''}
                          `}
                        >
                          {day}
                          {hasEvent(day) && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </button>
                      ) : (
                        <span className="w-10 h-10"></span>
                      )}
                    </li>
                  ))}
                </ul>
                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-6 text-sm text-[#05213C]">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#05213C] rounded-full"></div>
                      <span>Today</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span>Has Events</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Event Indicator</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}