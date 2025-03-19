import React, { useState, useEffect } from 'react';
import './OwnerInterface.css'; // Add this import for the CSS

function OwnerInterface() {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [clientLink, setClientLink] = useState('');
  
  // Hardcoded SheetDB ID
  const sheetDbId = 'icpu0frqm3el7';

  // Format date to "Month Name, Day of Week, Year" (e.g., "March 21, Thursday, 2025")
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  // Load existing slots when component mounts
  useEffect(() => {
    fetchSlots();
    // Create the client link with the hardcoded sheet ID
    setClientLink(`https://client-interface-pearl.vercel.app/${sheetDbId}`);
  }, []);

  // Fetch slots from SheetDB
  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://sheetdb.io/api/v1/${sheetDbId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }
      const data = await response.json();
      // Filter to only show slots with status "Available"
      const availableSlots = data.filter(slot => slot.status === 'Available');
      setAvailableSlots(availableSlots);
      setSuccessMessage('Slots loaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Error loading slots: ' + error.message);
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new time slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const date = e.target.date.value;
    const time = e.target.time.value;
    const slotId = `slot_${Date.now()}`;
    
    const newSlot = {
      id: slotId,
      date: date,
      time: time,
      status: 'Available',
      client_name: '',
      client_email: '',
      booking_date: '',
      zoom_option:'',
    };

    try {
      const response = await fetch(`https://sheetdb.io/api/v1/${sheetDbId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: newSlot })
      });

      if (!response.ok) {
        throw new Error('Failed to add slot');
      }

      setAvailableSlots([...availableSlots, newSlot]);
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

  // Delete a time slot
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://sheetdb.io/api/v1/${sheetDbId}/id/${slotId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete slot');
      }

      // Update the local state after successful deletion
      setAvailableSlots(availableSlots.filter(slot => slot.id !== slotId));
      setSuccessMessage('Slot deleted successfully! Client page automatically updated.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time to 12-hour format with AM/PM
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="container">
      <h1 className="title">Enter dates that you are availabled</h1>
      
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
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default OwnerInterface;