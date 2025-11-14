import React, { useState } from "react";
import "../css/customer-search-page.css";

function CustomerSearchPage() {
  const [code, setCode] = useState("");

  const handleInput = (value) => {
    setCode((prev) => {
      if (prev.length >= 4) return prev;
      return prev + value.toUpperCase();
    });
  };

  const handleBackspace = () => {
    setCode((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (/^[BDU]\d{3}$/.test(code)) {
      alert(`Subscription: ${code}`);
      setCode("");
    } else {
      alert("Code must be B/D/U + 3 digits (example: B123)");
    }
  };

  const buttons = [
    ["B", "U", "D"],
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

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

        {/* Keypad Grid */}
        <div className="keypad-grid">
          {buttons.flat().map((btn) => (
            <button
              key={btn}
              onClick={() => handleInput(btn)}
              className="keypad-btn"
            >
              {btn}
            </button>
          ))}

          {/* Backspace */}
          <button onClick={handleBackspace} className="keypad-btn">
            ←
          </button>

          {/* Zero */}
          <button
            onClick={() => handleInput("0")}
            className="keypad-btn"
          >
            0
          </button>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="submit-btn"
            disabled={!/^[BDU]\d{3}$/.test(code)}
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerSearchPage;
