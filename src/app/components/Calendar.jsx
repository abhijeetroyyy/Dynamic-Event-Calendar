"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameDay, isBefore } from "date-fns";
import { motion } from "framer-motion";
import { RRule } from 'rrule';
import { gsap } from "gsap";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventDetails, setEventDetails] = useState({
    name: "",
    startTime: "",
    endTime: "",
    description: "",
    category: "",
    recurrence: "" 
  });
  const [filterCategory, setFilterCategory] = useState(""); 
  const [filterRecurrence, setFilterRecurrence] = useState(""); 

  const eventInputRef = useRef(null);
  const categories = ['Work', 'Personal', 'Other'];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("events")) || [];
    setEvents(storedEvents);
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("events", JSON.stringify(events));
    }
  }, [events]);

  useEffect(() => {
    if (eventInputRef.current) {
      gsap.fromTo(eventInputRef.current, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 });
    }
  }, [eventDetails.startTime, eventDetails.endTime]);

  const handleEventChange = useCallback((e) => {
    setEventDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setEventDetails({
      name: "",
      startTime: "",
      endTime: "",
      description: "",
      category: "",
      recurrence: "",
    });
  };

  const handleEventSubmit = () => {
    if (!eventDetails.name || !eventDetails.startTime || !eventDetails.endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    const isOverlapping = events.some(event => 
      isSameDay(event.date, selectedDate) && 
      isBefore(event.startTime, eventDetails.endTime) && isBefore(eventDetails.startTime, event.endTime)
    );

    if (isOverlapping) {
      alert("Event timing overlaps with another event.");
      return;
    }

    let newEvent = {
      id: Date.now(),
      date: selectedDate,
      ...eventDetails,
      recurrenceRule: eventDetails.recurrence ? new RRule({
        freq: RRule.WEEKLY, 
        dtstart: selectedDate,
        interval: 1,
        count: 10, 
      }) : null,
    };

    if (eventDetails.recurrence) {
      const occurrences = newEvent.recurrenceRule.all();
      occurrences.forEach(occurrence => {
        setEvents((prevEvents) => [...prevEvents, { ...newEvent, date: occurrence, isRecurring: true }]);
      });
    } else {
      setEvents([...events, newEvent]);
    }

    closePanel();
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleRecurrenceFilterChange = (e) => {
    setFilterRecurrence(e.target.value);
  };

  const handleDeleteEvent = (eventId, eventDate) => {
    // Delete only the specific occurrence
    setEvents((prevEvents) => prevEvents.filter(event => event.id !== eventId || !isSameDay(event.date, eventDate)));
  };

  const handleEditEvent = (event) => {
    setEventDetails({ ...event });
    setSelectedDate(event.date);
    setIsPanelOpen(true);
  };

  const renderDaysOfWeek = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((day, index) => (
      <div key={index} className={`text-center font-semibold ${index === 0 || index === 6 ? 'text-red-500' : 'text-gray-500'}`}>
        {day}
      </div>
    ));
  }, []);

  const renderCalendarDays = useMemo(() => {
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days.map((day, index) => {
      const dayEvents = events.filter(event => isSameDay(event.date, day));
      const isToday = isSameDay(day, new Date());
      const isSelected = isSameDay(day, selectedDate);

      return (
        <motion.div
          key={index}
          className={`p-4 text-center rounded-lg cursor-pointer transition-all duration-300 ease-in-out 
            ${isToday ? "bg-yellow-300 text-black" : isSelected ? "bg-blue-500 text-white" : "bg-white text-gray-500"} 
            ${format(day, "MM") === format(currentMonth, "MM") ? "border-gray-300" : "border-gray-200"} 
            hover:bg-blue-100 active:bg-blue-300`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDayClick(day)}
        >
          {format(day, "d")}
          {dayEvents.length > 0 && (
            <div className="text-sm text-blue-500 mt-1">{`${dayEvents.length} Event${dayEvents.length > 1 ? "s" : ""}`}</div>
          )}
        </motion.div>
      );
    });
  }, [currentMonth, events, selectedDate]);

  const renderEventList = useMemo(() => {
    let filteredEvents = events;

    if (filterCategory) {
      filteredEvents = filteredEvents.filter(event => event.category === filterCategory);
    }

    if (filterRecurrence) {
      filteredEvents = filteredEvents.filter(event => event.recurrence === filterRecurrence);
    }

    const eventsInCurrentMonth = filteredEvents.filter(event => 
      format(event.date, "MM") === format(currentMonth, "MM")
    );

    if (eventsInCurrentMonth.length === 0) {
      return (
        <div className="text-center text-gray-500 font-semibold p-6 bg-gray-50 rounded-lg shadow-md">
          <p>No upcoming events this month.</p>
        </div>
      );
    }

    return eventsInCurrentMonth.map((event, idx) => (
      <div key={idx} className={`p-4 border rounded-lg mb-2 shadow-lg ${event.category === 'Work' ? 'bg-green-100' : event.category === 'Personal' ? 'bg-yellow-100' : 'bg-blue-100'} transition-all duration-200 ease-in-out hover:shadow-2xl`}>
        <h4 className="font-semibold text-lg">{event.name}</h4>
        <p className="text-sm text-gray-600">
          Date: {format(event.date, "MMMM dd, yyyy")} <br />
          Time: {event.startTime} - {event.endTime}
        </p>
        <p className="text-gray-500">{event.description}</p>
        <span className={`mt-2 inline-block text-sm ${event.category === 'Work' ? 'text-green-600' : event.category === 'Personal' ? 'text-yellow-600' : 'text-blue-600'}`}>
          {event.category}
        </span>
        {event.recurrence && (
          <div className="mt-2 text-sm text-gray-500">Recurs: {event.recurrence}</div>
        )}
        <div className="flex justify-between mt-2">
          <button onClick={() => handleEditEvent(event)} className="text-blue-500">Edit</button>
          <button onClick={() => handleDeleteEvent(event.id, event.date)} className="text-red-500">Delete</button>
        </div>
      </div>
    ));
  }, [events, currentMonth, filterCategory, filterRecurrence]);

  return (
    <div className="flex justify-center items-center min-h-screen mt-10 bg-gradient-to-r from-purple-500 to-blue-500 p-6 flex-col space-y-6">
      {/* Calendar */}
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={prevMonth} 
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Prev
          </button>
          <h2 className="text-xl font-semibold text-center">{format(currentMonth, "MMMM yyyy")}</h2>
          <button 
            onClick={nextMonth} 
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {renderDaysOfWeek}
          {renderCalendarDays}
        </div>
      </motion.div>

      {/* Filter Section */}
      <div className="w-full max-w-4xl flex justify-between gap-4 mb-4">
        <select
          value={filterCategory}
          onChange={handleFilterChange}
          className="w-full sm:w-1/3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category, idx) => (
            <option key={idx} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filterRecurrence}
          onChange={handleRecurrenceFilterChange}
          className="w-full sm:w-1/3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Recurrences</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      {/* Event Panel */}
      {isPanelOpen && (
        <motion.div
          ref={eventInputRef}
          className="fixed inset-0 bg-opacity-50 bg-black flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Add Event</h2>
            <form onSubmit={handleEventSubmit}>
              <input 
                type="text" 
                name="name"
                value={eventDetails.name}
                onChange={handleEventChange}
                placeholder="Event Name"
                className="w-full p-2 border rounded-md mb-4"
                required
              />
              <input 
                type="datetime-local" 
                name="startTime" 
                value={eventDetails.startTime}
                onChange={handleEventChange}
                className="w-full p-2 border rounded-md mb-4"
                required
              />
              <input 
                type="datetime-local"
                name="endTime"
                value={eventDetails.endTime}
                onChange={handleEventChange}
                className="w-full p-2 border rounded-md mb-4"
                required
              />
              <textarea
                name="description"
                value={eventDetails.description}
                onChange={handleEventChange}
                placeholder="Event Description"
                className="w-full p-2 border rounded-md mb-4"
                rows="4"
              />
              <select
                name="category"
                value={eventDetails.category}
                onChange={handleEventChange}
                className="w-full p-2 border rounded-md mb-4"
              >
                <option value="">Select Category</option>
                {categories.map((category, idx) => (
                  <option key={idx} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                name="recurrence"
                value={eventDetails.recurrence}
                onChange={handleEventChange}
                className="w-full p-2 border rounded-md mb-4"
              >
                <option value="">No Recurrence</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>

              <div className="flex justify-between">
                <button type="button" onClick={closePanel} className="px-4 py-2 bg-gray-300 text-black rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save</button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* Event List */}
      <div className="w-full max-w-4xl mt-10">
        {renderEventList}
      </div>
    </div>
  );
};

export default Calendar;
    