import React, { useState } from "react";

function CustomerSearchPage() {
  const [code, setCode] = useState("");

  const handleInput = (value) => {
    if (code.length >= 4) return; // Limit to 4 characters
    setCode((prev) => prev + value.toUpperCase());
  };

  const handleClear = () => setCode("");

  const handleSubmit = () => {
    if (/^[BDU]\d{3}$/.test(code)) {
      alert(`Subscription found: ${code}`);
      // TODO: Replace alert() with backend call or route navigation
      setCode("");
    } else {
      alert("Invalid code. Use format: B/D/U followed by 3 digits (e.g. B123)");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
        <h1 className="text-2xl font-bold text-center mb-4">
          Car Wash Search
        </h1>

        {/* Search Box */}
        <input
          type="text"
          value={code}
          readOnly
          className="w-full text-center text-xl border rounded-lg p-3 mb-4"
          placeholder="Enter code (B123)"
        />

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {["B", "D", "U", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map(
            (key) => (
              <button
                key={key}
                onClick={() => handleInput(key)}
                className="bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 active:scale-95 transition"
              >
                {key}
              </button>
            )
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between gap-3">
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-400 text-white py-3 rounded-lg text-lg hover:bg-gray-500"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg text-lg hover:bg-green-600"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerSearchPage;
