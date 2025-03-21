import React, { useState, useEffect } from 'react';
import './OwnerInterface.css';

// Set the base URL for your backend API (adjust port/domain as needed)
const API_BASE_URL = 'http://localhost:3000/api';

function OwnerInterface() {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [clientLink, setClientLink] = useState('');

  // Your spreadsheet details for display or linking purposes
  const spreadsheetId = '1NWWqxGX7cMu0fqZ9o8GXCQBE6e8E97wzql8T6Pdito8';
  const sheetName = "Guadalupes Scholars Interview"; // For informational use

  // On mount, fetch available slots and set up client link.
  useEffect(() => {
    fetchSlots();
    // Example client link (update to your actual client interface URL)
    setClientLink(`https://client-interface-pearl.vercel.app/${spreadsheetId}`);
  }, []);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('en-US', options);
  };

  // Helper function to format time to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Fetch available slots from the backend
  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/slots`);
      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }
      const data = await response.json();
      // Assume your backend returns only available slots
      setAvailableSlots(data);
      setSuccessMessage('Slots loaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error loading slots: ' + error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new time slot using your backend API
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const date = e.target.date.value;
    const time = e.target.time.value;
    // Prepare new slot data – the backend can generate a unique slot ID
    const newSlot = { date, time, status: 'Available' };
    
    try {
      const response = await fetch(`${API_BASE_URL}/add-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSlot)
      });
      if (!response.ok) {
        throw new Error('Failed to add slot');
      }
      // Re-fetch slots after adding a new one
      await fetchSlots();
      setSuccessMessage('Slot added successfully! Client page automatically updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
      e.target.reset();
    } catch (error) {
      setErrorMessage('Error adding slot: ' + error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a time slot using your backend API
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delete-slot/${slotId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete slot');
      }
      // Refresh the slot list after deletion
      await fetchSlots();
      setSuccessMessage('Slot deleted successfully! Client page automatically updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error deleting slot: ' + error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Enter dates that you are available</h1>
      
      {/* Add Time Slot Form */}
      <form onSubmit={handleAddSlot} className="section">
        <div className="form-group">
          <label className="label">Date</label>
          <input 
            type="date" 
            name="date" 
            className="input" 
            required 
          />
        </div>
        <div className="form-group">
          <label className="label">Time</label>
          <input 
            type="time" 
            name="time" 
            className="input" 
            required 
          />
        </div>
        <button 
          type="submit" 
          className="button primary-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Time Slot'}
        </button>
      </form>
      
      {/* Available Slots List */}
      <div className="section">
        <div className="header-with-action">
          <h2 className="subtitle">Available Time Slots</h2>
          <button 
            onClick={fetchSlots} 
            className="button small-button" 
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
        {availableSlots.length > 0 ? (
          <ul className="slot-list">
            {availableSlots.map(slot => (
              <li key={slot.id} className="slot-item">
                <span>{formatDate(slot.date)} at {formatTime(slot.time)}</span>
                <button 
                  onClick={() => handleDeleteSlot(slot.id)} 
                  className="delete-button"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-message">No time slots available or still loading...</p>
        )}
      </div>
      
      {/* Display Client Link */}
      <div className="client-link-section">
        <p className="link-title">Your student booking link:</p>
        <div className="link-container">
          <input 
            type="text" 
            value={clientLink} 
            className="link-input" 
            readOnly 
          />
          <button 
            onClick={() => {
              navigator.clipboard.writeText(clientLink);
              setSuccessMessage('Link copied to clipboard!');
              setTimeout(() => setSuccessMessage(''), 3000);
            }}
            className="copy-button"
          >
            Copy
          </button>
        </div>
        <p className="help-text">
          Share this link with your clients to let them book appointments.
        </p>
      </div>
      
      {/* Status Messages */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
}

export default OwnerInterface;
