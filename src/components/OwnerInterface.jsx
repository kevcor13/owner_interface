import React, { useState, useEffect } from 'react';
import './OwnerInterface.css'; // Add this import for the CSS

function OwnerInterface() {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetId, setSheetId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [clientLink, setClientLink] = useState('');

  // Load existing slots when sheet ID is entered
  useEffect(() => {
    if (sheetId) {
      fetchSlots();
      // Create the client link with the sheet ID
      // This assumes you'll deploy the client app at a different URL
      setClientLink(`https://client-interface-pearl.vercel.app/${sheetId}`);
    }
  }, [sheetId]);

  // Fetch slots from SheetDB
  const fetchSlots = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://sheetdb.io/api/v1/${sheetId}`);
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
    if (!sheetId) {
      setErrorMessage('Please enter a Sheet ID first');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

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
      booking_date: ''
    };

    try {
      const response = await fetch(`https://sheetdb.io/api/v1/${sheetId}`, {
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
      const response = await fetch(`https://sheetdb.io/api/v1/${sheetId}/id/${slotId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete slot');
      }

      // Update the local state after successful deletion
      setAvailableSlots(availableSlots.filter(slot => slot.id !== slotId));
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
      <h1 className="title">Appointment Scheduler - Admin Interface</h1>
      
      {/* Sheet ID Input */}
      <div className="section">
        <label className="label">SheetDB ID</label>
        <input 
          type="text" 
          className="input"
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
          placeholder="Enter your SheetDB ID"
        />
        <p className="help-text">
          Get this from SheetDB after connecting your Google Sheet
        </p>
      </div>
      
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
          disabled={isLoading || !sheetId}
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
            disabled={isLoading || !sheetId}
          >
            Refresh
          </button>
        </div>
        
        {availableSlots.length > 0 ? (
          <ul className="slot-list">
            {availableSlots.map(slot => (
              <li key={slot.id} className="slot-item">
                <span>{slot.date} at {slot.time}</span>
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
          <p className="empty-message">No time slots added yet.</p>
        )}
      </div>
      
      {/* Display Client Link */}
      {clientLink && (
        <div className="client-link-section">
          <p className="link-title">Your client booking link:</p>
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
            You'll need to replace "your-client-app-url.com" with your actual client app URL.
          </p>
        </div>
      )}
      
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