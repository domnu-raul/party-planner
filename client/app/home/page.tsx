"use client";
import React, { useEffect, useState } from 'react';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [attendanceSelections, setAttendanceSelections] = useState({});
  const [userId, setUserId] = useState(""); 
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/events/all/', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          const errorData = await response.json();
          console.error("Error fetching events:", errorData);
        }
      } catch (error) {
        console.error("Network Error:", error);
      }
    };

    fetchEvents();
  }, [updated]);

  useEffect(() => {
      const fetchUsername = async () => {
            try {
                const response = await fetch('http://localhost:8000/auth/me', {
                    credentials: 'include',
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setUserId(data.username);
                } else {
                    const errorData = await response.json();
                    console.error("Error fetching user:", errorData);
                }
            } catch (error) {
                console.error("Network Error:", error);
            }
        }

    fetchUsername();
  }, []);

  const handleAttendEvent = async (eventId : string) => {
    const { attendanceMethod, selectedService, selectedItem } = attendanceSelections[eventId] || {};

    const attendData = {
      service: attendanceMethod === 'service' ? selectedService : undefined,
      wish_list_item: attendanceMethod === 'item' && selectedItem?.name ? [selectedItem.name, selectedItem.quantity] : undefined,
      fee_payment: attendanceMethod === 'fee' ? 1 : undefined,
    };

    try {
      const response = await fetch(`http://localhost:8000/events/attend/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(attendData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Successfully attended:", data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "An error occurred.");
        console.error("Error attending event:", errorData);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setError("Network error occurred.");
    }
    setUpdated(!updated);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error("Error logging out");
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  const handleSelectionChange = (eventId, field, value) => {
    setAttendanceSelections(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [field]: value,
        ...(field === 'attendanceMethod' ? { selectedService: '', selectedItem: { name: '', quantity: 0 } } : {}),
      },
    }));
  };

    const attendingEvents = events.filter(event => 
      event.attendees.some(attendee => 
        Array.isArray(attendee) ? attendee[0] === userId : attendee === userId
      )
    );

    const notAttendingEvents = events.filter(event => 
      !event.attendees.some(attendee => 
        Array.isArray(attendee) ? attendee[0] === userId : attendee === userId
      )
    );

  return (
    <div className="flex flex-col min-h-screen h-full w-screen items-center bg-stone-300 p-4 text-black">
      <div className="w-full flex flex-row justify-between text-black">
        Hello, {userId}! 
        <button onClick={handleLogout} className="text-black underline">Logout</button>
      </div>

      <h1 className="text-3xl font-bold mb-4">Events</h1>

      <h2 className="text-2xl font-semibold mb-2">Attending Events</h2>
      <div className="w-full max-w-4xl text-gray-50 mb-4">
        {attendingEvents.length === 0 ? (
          <p>No events you are attending.</p>
        ) : (
          attendingEvents.map(event => (
            <div key={event._id} className="border p-4 mb-4 rounded-lg bg-red-800">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <p>{event.description}</p>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Location:</strong> {event.location}</p>
            </div>
          ))
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-2">Other Events</h2>
      <div className="w-full max-w-4xl text-gray-50">
        {notAttendingEvents.length === 0 ? (
          <p>No other events available.</p>
        ) : (
          notAttendingEvents.map(event => (
            <div key={event._id} className="border p-4 mb-4 rounded-lg bg-red-800">
              <h3 className="text-xl font-semibold">AAA</h3>
              <p>{event.description}</p>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Location:</strong> {event.location}</p>

              <div className="my-4">
                <label htmlFor={`attendance-method-${event._id}`} className="block mb-2">Select Attendance Method:</label>
                <select
                  id={`attendance-method-${event._id}`}
                  value={attendanceSelections[event._id]?.attendanceMethod || ''}
                  onChange={(e) => handleSelectionChange(event._id, 'attendanceMethod', e.target.value)}
                  className="border p-2 rounded text-black"
                >
                  <option value="">--Select--</option>
                  <option value="service">Service</option>
                  <option value="item">Item</option>
                  <option value="fee">Fee</option>
                </select>
              </div>

              {attendanceSelections[event._id]?.attendanceMethod === 'service' && (
                <div className="my-4">
                  <label htmlFor={`service-${event._id}`} className="block mb-2">Select Service:</label>
                  <select
                    id={`service-${event._id}`}
                    value={attendanceSelections[event._id]?.selectedService || ''}
                    onChange={(e) => handleSelectionChange(event._id, 'selectedService', e.target.value)}
                    className="border p-2 rounded w-full text-black"
                  >
                    <option value="">--Select Service--</option>
                    {Object.keys(event.services).map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
              )}

              {attendanceSelections[event._id]?.attendanceMethod === 'item' && (
                <div>
                  <div className="my-4">
                    <label htmlFor={`item-name-${event._id}`} className="block mb-2">Select Item:</label>
                    <select
                      id={`item-name-${event._id}`}
                      value={attendanceSelections[event._id]?.selectedItem?.name || ''}
                      onChange={(e) => handleSelectionChange(event._id, 'selectedItem', { ...attendanceSelections[event._id]?.selectedItem, name: e.target.value })}
                      className="border p-2 rounded w-full text-black"
                    >
                      <option value="">--Select Item--</option>
                      {Object.keys(event.wish_list).map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="my-4">
                    <label htmlFor={`item-quantity-${event._id}`} className="block mb-2">Quantity:</label>
                    <input
                      type="number"
                      id={`item-quantity-${event._id}`}
                      value={attendanceSelections[event._id]?.selectedItem?.quantity || 0}
                      onChange={(e) => handleSelectionChange(event._id, 'selectedItem', { ...attendanceSelections[event._id]?.selectedItem, quantity: Number(e.target.value) })}
                      className="border p-2 rounded w-full text-black"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>
              )}

              {attendanceSelections[event._id]?.attendanceMethod === 'fee' && (
                <div className="my-4">
                  <p>This event requires a fee of ${event.fee}.</p>
                </div>
              )}

              <button 
                onClick={() => handleAttendEvent(event._id)} 
                className="bg-blue-500 text-white rounded py-2 px-4 mt-4"
              >
                Attend
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

