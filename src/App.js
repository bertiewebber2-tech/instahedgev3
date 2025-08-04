import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

const hedgeTypes = [
  {
    name: "Bay",
    latin: "Laurus nobilis",
    image: "/Bay.jpg",
    sizes: [
      { label: "Small (30cm)", pricePerMeter: 20 },
      { label: "Medium (60cm)", pricePerMeter: 30 },
      { label: "Large (1m+)", pricePerMeter: 45 },
    ],
  },
  {
    name: "Cherry Laurel",
    latin: "Prunus laurocerasus rotundifolia",
    image: "/Cherry Laurel.jpg",
    sizes: [
      { label: "Small (30cm)", pricePerMeter: 18 },
      { label: "Medium (60cm)", pricePerMeter: 28 },
      { label: "Large (1m+)", pricePerMeter: 42 },
    ],
  },
  {
    name: "Gilt Edge Silverberry",
    latin: "Elaeagnus ebbingei 'Gilt Edge'",
    image: "/Gilt Edge Silverberry.jpg",
    sizes: [
      { label: "Small (30cm)", pricePerMeter: 22 },
      { label: "Medium (60cm)", pricePerMeter: 32 },
      { label: "Large (1m+)", pricePerMeter: 48 },
    ],
  },
  {
    name: "Limelight Silverberry",
    latin: "Elaeagnus ebbingei 'Limelight'",
    image: "/Limelight Silverberry.jpg",
    sizes: [
      { label: "Small (30cm)", pricePerMeter: 20 },
      { label: "Medium (60cm)", pricePerMeter: 30 },
      { label: "Large (1m+)", pricePerMeter: 45 },
    ],
  },
  {
    name: "Photinia 'Red Robin'",
    latin: "Photinia fraseri",
    image: "/Photina Red Robin.jpg",
    sizes: [
      { label: "Small (30cm)", pricePerMeter: 25 },
      { label: "Medium (60cm)", pricePerMeter: 35 },
      { label: "Large (1m+)", pricePerMeter: 50 },
    ],
  },
  {
    name: "Portuguese Laurel",
    latin: "Prunus lusitanica angustifolia",
    image: "/Portuguese.jpg",
    sizes: [
      { label: "Small (30cm)", pricePerMeter: 23 },
      { label: "Medium (60cm)", pricePerMeter: 33 },
      { label: "Large (1m+)", pricePerMeter: 48 },
    ],
  },
  {
    name: "Silverberry",
    latin: "Elaeagnus ebbingei",
    image: "/Silverberry.jpg",
    sizes: [
      { label: "Small (30cm)", pricePerMeter: 21 },
      { label: "Medium (60cm)", pricePerMeter: 31 },
      { label: "Large (1m+)", pricePerMeter: 46 },
    ],
  },
  {
    name: "Glossy Privet",
    latin: "Ligustrum lucidum 'Excelsum Superbum'",
    image: "/Wax Leaf Privet.jpeg",
    sizes: [
      { label: "Small (30cm)", pricePerMeter: 19 },
      { label: "Medium (60cm)", pricePerMeter: 29 },
      { label: "Large (1m+)", pricePerMeter: 44 },
    ],
  },
  {
    name: "Yew",
    latin: "Taxus baccata",
    image: "/yew.jpg",
    sizes: [
      { label: "Small (30cm)", pricePerMeter: 26 },
      { label: "Medium (60cm)", pricePerMeter: 36 },
      { label: "Large (1m+)", pricePerMeter: 52 },
    ],
  },
];

export default function App() {
  const [step, setStep] = useState(0);
  const [postcode, setPostcode] = useState("");
  const [postcodeError, setPostcodeError] = useState("");
  const [checkingPostcode, setCheckingPostcode] = useState(false);
  const [userPostcode, setUserPostcode] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [selectedHedge, setSelectedHedge] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [length, setLength] = useState("");
  const [includeLabour, setIncludeLabour] = useState(false);
  const [loading, setLoading] = useState(false);

  const labourCostPerMeter = 10;
  const baseCoords = { lat: 50.792, lon: 0.2951 }; // BN22 9PP

  const totalCost = () => {
    if (!selectedSize || !length) return 0;
    const plantCost = selectedSize.pricePerMeter * parseFloat(length);
    const labourCost = includeLabour
      ? labourCostPerMeter * parseFloat(length)
      : 0;
    return plantCost + labourCost;
  };

  const reset = () => {
    setStep(0);
    setPostcode("");
    setPostcodeError("");
    setCheckingPostcode(false);
    setSelectedHedge(null);
    setSelectedSize(null);
    setLength("");
    setIncludeLabour(false);
    setLoading(false);
  };

  useEffect(() => {
    if (step === 6) {
      setLoading(true);
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  const haversineDistance = (coord1, coord2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lon - coord1.lon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const handlePostcodeSubmit = async () => {
    setCheckingPostcode(true);
    setPostcodeError("");

    try {
      const cleaned = postcode.trim().replace(/\s+/g, "");
      const response = await fetch(
        `https://api.postcodes.io/postcodes/${cleaned}`
      );
      const data = await response.json();
      const loc = data.result;
      setUserPostcode(cleaned);
      setUserLocation(loc.parish || loc.admin_ward || "Unknown");

      if (!data.result) {
        setPostcodeError("Invalid postcode. Please try again.");
        setCheckingPostcode(false);
        return;
      }

      const userCoords = {
        lat: data.result.latitude,
        lon: data.result.longitude,
      };

      const distance = haversineDistance(baseCoords, userCoords);

      if (distance > 20) {
        setPostcodeError(`Sorry you are outside our range of service`);
      } else {
        setStep(2); // Proceed to hedge selection
      }
    } catch (err) {
      setPostcodeError("Error checking postcode. Try again.");
    } finally {
      setCheckingPostcode(false);
    }
  };

  const handleSendInquiry = () => {
    const templateParams = {
      hedgeType: selectedHedge.name,
      latinName: selectedHedge.latin,
      size: selectedSize.label,
      pricePerMeter: selectedSize.pricePerMeter,
      length,
      includeLabour: includeLabour ? "Yes" : "No",
      totalCost: totalCost().toFixed(2),
      userLocation: userLocation || "Unknown",
      contactInfo: contactInfo || "Not provided",
    };

    emailjs
      .send(
        "service_udguane",
        "template_lx5xyq3",
        templateParams,
        "TC3g11TfYsy_TxvRP"
      )
      .then(
        () => {
          alert("Inquiry sent successfully!");
        },
        (error) => {
          console.error("Email error:", error);
          alert("Failed to send inquiry.");
        }
      );
  };

  return (
    <div className="font-[Montserrat] font-light min-h-screen bg-[#e4d8b4]">
      {step > 0 && (
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center text-[#3b3b3b] hover:text-black transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>
      )}

      {step === 0 && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#74875b]">
          <img
            src="/HaloFree_Final_Logo.png"
            alt="InstaHedge Logo"
            className="w-48 mb-6"
            style={{ filter: "drop-shadow(0 0 1px #74875b)" }}
          />
          <button
            onClick={() => setStep(1)}
            className="bg-[#74875b] hover:bg-[#869868] text-[#f5f5f5] border-2 border-[#e4d8b4] rounded-full px-8 py-3 text-lg font-medium shadow-sm transition-all duration-200"
          >
            Start
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#74875b] px-4">
          <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
            <h2 className="text-xl font-semibold text-[#3b3b3b]">
              Check Service Eligibility
            </h2>
            <p className="text-sm text-gray-600 mt-3 mb-4">
              We operate within 20km of Eastbourne
            </p>

            <input
              type="text"
              className="border border-gray-300 p-3 rounded w-full mb-4 text-center text-lg uppercase"
              placeholder="Enter postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
            {postcodeError && (
              <p className="text-red-600 text-sm mb-4">{postcodeError}</p>
            )}
            <button
              onClick={handlePostcodeSubmit}
              disabled={checkingPostcode}
              className="bg-[#74875b] text-white px-6 py-2 rounded-full font-medium hover:bg-[#8a9e6f] transition disabled:opacity-50"
            >
              {checkingPostcode ? "Checking..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {/* Existing steps now offset by +1 */}
      {step === 2 && (
        <div className="p-6">
          <h2 className="text-xl mb-4 font-semibold text-center">
            Select Hedge Type
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {hedgeTypes.map((hedge, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedHedge(hedge);
                  setStep(3);
                }}
                className="cursor-pointer border rounded-2xl p-2 text-center hover:border-black"
              >
                <img
                  src={hedge.image}
                  alt={hedge.name}
                  className="w-full aspect-square object-cover rounded-xl"
                />
                <div className="mt-2 text-sm font-semibold">{hedge.name}</div>
                <div className="text-xs italic font-serif text-gray-700">
                  {hedge.latin}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#74875b] px-4">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Select Hedge Height
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {selectedHedge?.sizes.map((size, index) => {
              const sizeImages = [
                "/smallhedge.png",
                "/mediumhedge.png",
                "/largehedge.png",
              ];

              return (
                <div
                  key={size.label}
                  onClick={() => {
                    setSelectedSize(size);
                    setStep(4);
                  }}
                  className="w-40 h-40 bg-[#e4d8b4] rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={sizeImages[index]}
                    alt={size.label}
                    className="w-28 h-28 object-contain rounded-md mb-2"
                  />
                  <p className="text-black text-center text-sm">{size.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#e4d8b4] px-4">
          <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
            <h2 className="text-xl mb-6 font-semibold text-[#3b3b3b]">
              Enter Hedge Length (meters)
            </h2>
            <input
              type="number"
              className="border border-gray-300 p-3 rounded w-full mb-6 text-center text-lg"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              min={0}
            />
            <button
              className="bg-[#74875b] text-white px-6 py-2 rounded-full font-medium hover:bg-[#8a9e6f] transition"
              onClick={() => setStep(5)}
              disabled={!length}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#e4d8b4] px-4">
          <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
            <h2 className="text-2xl font-semibold mb-6 text-[#3b3b3b]">
              Add-ons
            </h2>

            <div className="flex flex-col items-center mb-6">
              <label className="inline-flex items-center gap-2 text-lg">
                <input
                  type="checkbox"
                  className="w-5 h-5"
                  checked={includeLabour}
                  onChange={() => setIncludeLabour(!includeLabour)}
                />
                Include planting
              </label>
            </div>

            <button
              className="bg-[#74875b] text-white px-6 py-2 rounded-full font-medium hover:bg-[#8a9e6f] transition"
              onClick={() => setStep(6)}
            >
              Show Summary
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="min-h-screen flex items-center justify-center">
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow w-full max-w-md text-left">
              <div className="w-full text-center">
                <h2 className="text-xl font-semibold mb-4">Your Summary</h2>
              </div>

              <img
                src={selectedHedge.image}
                alt={selectedHedge.name}
                className="w-full rounded-xl aspect-video object-cover mb-4"
              />
              <ul className="text-sm space-y-2">
                <li>
                  <strong>Hedge Type:</strong> {selectedHedge.name}
                </li>
                <li>
                  <strong>Latin Name:</strong>{" "}
                  <em className="font-serif">{selectedHedge.latin}</em>
                </li>
                <li>
                  <strong>Size:</strong> {selectedSize.label}
                </li>
                <li>
                  <strong>Cost per Meter:</strong> £{selectedSize.pricePerMeter}
                </li>
                <li>
                  <strong>Length:</strong> {length} meters
                </li>
                <li>
                  <strong>Labour Cost:</strong> £
                  {includeLabour
                    ? (labourCostPerMeter * parseFloat(length)).toFixed(2)
                    : "0.00"}
                </li>
                <li>
                  <strong>Total Cost:</strong> £{totalCost().toFixed(2)}
                </li>
              </ul>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your contact information (email or phone):
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="border border-gray-300 p-2 rounded w-full mb-4"
                />
              </div>

              <div className="mt-6 flex justify-between gap-3">
                <button
                  className="bg-[#74875b] hover:bg-[#8a9e6f] text-white px-4 py-2 rounded text-sm w-1/2"
                  onClick={handleSendInquiry}
                >
                  Send Inquiry
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm w-1/2"
                  onClick={reset}
                >
                  Start Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
