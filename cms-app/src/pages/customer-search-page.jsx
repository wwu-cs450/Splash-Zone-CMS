import React, { useState } from "react";
import "../css/customer-search-page.css";
import { getMember } from "../api/firebase-crud";

function CustomerSearchPage() {
  const [code, setCode] = useState("");
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInput = (value) => {
    setCode((prev) => {
      if (prev.length >= 4) return prev;
      return prev + value.toUpperCase();
    });
  };

  const handleBackspace = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!/^[BDU]\d{3}$/.test(code)) {
      setError("Code must be B/D/U + 3 digits (example: B123)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const member = await getMember(code);

      if (member) {
        setMemberData(member);
      } else {
        setError(`No member found with ID: ${code}`);
      }
    } catch (err) {
      setError(`Error fetching member: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setMemberData(null);
    setError(null);
    setCode("");
  };

  const buttons = [
    ["B", "D", "U"],
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  // If member data is loaded, show member details view
  if (memberData) {
    return (
      <div className="search-page-container">
        <div className="member-details-container">
          <button onClick={handleBack} className="back-arrow" aria-label="Back to search">
            ← Back
          </button>

          <h2>Member Details</h2>

          <div className="member-info">
            <div className="info-row">
              <span className="info-label">ID:</span>
              <span className="info-value">{memberData.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{memberData.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Car:</span>
              <span className="info-value">{memberData.car}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Active:</span>
              <span className="info-value">{memberData.isActive ? "Yes" : "No"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Valid Payment:</span>
              <span className="info-value">{memberData.validPayment ? "Yes" : "No"}</span>
            </div>
            {memberData.notes && (
              <div className="info-row">
                <span className="info-label">Notes:</span>
                <span className="info-value">{memberData.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page-container">
      <div className="keypad-container">

        {/* Display Box */}
        <div
          className="display-box"
          role="textbox"
          aria-label="Customer code input"
          aria-readonly="true"
        >
          {code}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading-message">
            Loading...
          </div>
        )}

        {/* Keypad Grid */}
        <div className="keypad-grid">
          {buttons.flat().map((btn) => (
            <button
              key={btn}
              onClick={() => handleInput(btn)}
              className="keypad-btn"
              disabled={loading}
            >
              {btn}
            </button>
          ))}

          {/* Backspace */}
          <button onClick={handleBackspace} className="keypad-btn" disabled={loading}>
            ←
          </button>

          {/* Zero */}
          <button
            onClick={() => handleInput("0")}
            className="keypad-btn"
            disabled={loading}
          >
            0
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="submit-btn"
            disabled={!/^[BDU]\d{3}$/.test(code) || loading}
            aria-label="Submit customer code"
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerSearchPage;
