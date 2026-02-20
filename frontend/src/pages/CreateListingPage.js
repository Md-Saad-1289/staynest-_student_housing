import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listingService } from '../services/api';

export const CreateListingPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(isEditMode);
  
  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  
  // Pricing
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [utilities, setUtilities] = useState('');
  
  // Details
  const [genderAllowed, setGenderAllowed] = useState('both');
  const [rooms, setRooms] = useState('1');
  const [capacity, setCapacity] = useState('1');
  const [furnished, setFurnished] = useState('semi');
  
  // Amenities
  const [amenities, setAmenities] = useState({
    wifi: false,
    ac: false,
    parking: false,
    laundry: false,
    kitchen: false,
    balcony: false,
    security24: false,
    gatekeeper: false,
  });
  
  // Media
  const [photoUrl, setPhotoUrl] = useState('');
  const [additionalPhotos, setAdditionalPhotos] = useState(['', '', '']);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Load existing listing data if editing
  useEffect(() => {
    if (isEditMode) {
      const loadListing = async () => {
        try {
          setLoadingData(true);
          const response = await listingService.getListing(id);
          const listing = response.data || response;
          
          setTitle(listing.title || '');
          setDescription(listing.description || '');
          setAddress(listing.address || '');
          setCity(listing.city || '');
          setType(listing.type || '');
          setRent(listing.rent?.toString() || '');
          setDeposit(listing.deposit?.toString() || '');
          setUtilities(listing.utilities?.toString() || '');
          setGenderAllowed(listing.genderAllowed || 'both');
          setRooms(listing.rooms?.toString() || '1');
          setCapacity(listing.capacity?.toString() || '1');
          setFurnished(listing.furnished || 'semi');
          
          if (listing.facilities) {
            setAmenities({
              wifi: listing.facilities.wifi || false,
              ac: listing.facilities.ac || false,
              parking: listing.facilities.parking || false,
              laundry: listing.facilities.laundry || false,
              kitchen: listing.facilities.kitchen || false,
              balcony: listing.facilities.balcony || false,
              security24: listing.facilities.security24 || false,
              gatekeeper: listing.facilities.gatekeeper || false,
            });
          }
          
          if (listing.photos && listing.photos.length > 0) {
            setPhotoUrl(listing.photos[0] || '');
            setAdditionalPhotos([
              listing.photos[1] || '',
              listing.photos[2] || '',
              listing.photos[3] || '',
            ]);
          }
        } catch (err) {
          setError('Failed to load listing data');
          console.error('Load listing error:', err);
        } finally {
          setLoadingData(false);
        }
      };
      loadListing();
    }
  }, [id, isEditMode]);
  
  const amenityOptions = [
    { id: 'wifi', label: 'WiFi', icon: 'fa-wifi' },
    { id: 'ac', label: 'Air Conditioning', icon: 'fa-snowflake' },
    { id: 'parking', label: 'Parking', icon: 'fa-car' },
    { id: 'laundry', label: 'Laundry', icon: 'fa-shirt' },
    { id: 'kitchen', label: 'Kitchen', icon: 'fa-utensils' },
    { id: 'balcony', label: 'Balcony', icon: 'fa-gopuram' },
    { id: 'security24', label: '24/7 Security', icon: 'fa-shield' },
    { id: 'gatekeeper', label: 'Gate Keeper', icon: 'fa-user-shield' },
  ];

  const toggleAmenity = (id) => {
    setAmenities(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const validateStep = (currentStep) => {
    setError('');
    if (currentStep === 1) {
      if (!title.trim() || !description.trim() || !address.trim() || !city.trim() || !type) {
        setError('Step 1: Please fill all required fields');
        return false;
      }
    } else if (currentStep === 2) {
      if (!rent || !deposit) {
        setError('Step 2: Please enter rent and deposit');
        return false;
      }
    } else if (currentStep === 3) {
      if (!rooms || !capacity) {
        setError('Step 3: Please fill all required fields');
        return false;
      }
    }
    return true;
  };
  
  const handleNext = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateStep(step)) return;
    setStep((prev) => {
      const next = Math.min(prev + 1, 4);
      return next;
    });
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) {}
  };
  
  const handlePrevious = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    const allPhotos = [photoUrl, ...additionalPhotos].filter(p => p.trim());

    const facilities = {};
    Object.keys(amenities).forEach((k) => {
      if (amenities[k]) facilities[k] = true;
    });

    const payload = {
      title,
      description,
      address,
      city,
      type,
      rent: parseFloat(rent),
      deposit: parseFloat(deposit),
      utilities: utilities ? parseFloat(utilities) : 0,
      genderAllowed,
      rooms: parseInt(rooms),
      capacity: parseInt(capacity),
      furnished,
      facilities,
      photos: allPhotos.length > 0 ? allPhotos : [],
    };

    try {
      setLoading(true);
      if (isEditMode) {
        await listingService.updateListing(id, payload);
        alert('✓ Listing updated successfully');
      } else {
        await listingService.createListing(payload);
        alert('✓ Listing created successfully');
      }
      navigate('/dashboard/owner');
    } catch (err) {
      setError(err?.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} listing`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Loading State */}
        {loadingData && (
          <div className="text-center py-12">
            <div className="inline-block">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-gray-600 mt-4">Loading listing data...</p>
            </div>
          </div>
        )}

        {!loadingData && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                <i className={`fas ${isEditMode ? 'fa-edit' : 'fa-plus'} text-blue-600`}></i>
                {isEditMode ? 'Edit Your Property' : 'List Your Property'}
              </h1>
              <p className="text-gray-600 text-lg">Complete {step} of 4 steps to {isEditMode ? 'update' : 'create'} your listing</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 transition ${
                  num <= step ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' : 'bg-gray-300'
                }`}>
                  {num <= step - 1 ? <i className="fas fa-check"></i> : num}
                </div>
                <span className={`text-sm font-semibold ${num <= step ? 'text-blue-600' : 'text-gray-500'}`}>
                  {['Basic Info', 'Pricing', 'Details', 'Amenities'][num - 1]}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className={`h-1 flex-1 rounded-full transition ${num <= step ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'}`}></div>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 animate-pulse">
            <i className="fas fa-circle-exclamation text-xl mt-0.5"></i>
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && step < 4) { e.preventDefault(); } }} className="p-8">
            {/* STEP 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-blue-200">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                </div>

                <div>
                  <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                    <i className="fas fa-heading text-blue-600"></i> Property Title *
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="e.g., Premium Female Mess in Dhanmondi"
                  />
                </div>

                <div>
                  <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                    <i className="fas fa-pen text-purple-600"></i> Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    rows="4"
                    placeholder="Describe your property, rules, nearby areas, etc..."
                  />
                </div>

                <div>
                  <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                    <i className="fas fa-map-marker-alt text-red-600"></i> Address *
                  </label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="e.g., House 45, Road 12, Gulshan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                      <i className="fas fa-city text-purple-600"></i> City *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="">Select City</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Barisal">Barisal</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                      <i className="fas fa-building text-green-600"></i> Property Type *
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="">Select Type</option>
                      <option value="mess">Mess</option>
                      <option value="hostel">Hostel</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pricing */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-green-200">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <h2 className="text-2xl font-bold text-gray-800">Pricing Details</h2>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-green-700 font-semibold flex items-center gap-2">
                    <i className="fas fa-lightbulb"></i> Set competitive prices to attract more students
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                      <i className="fas fa-money-bill-wave text-green-600"></i> Monthly Rent (৳) *
                    </label>
                    <input
                      value={rent}
                      onChange={(e) => setRent(e.target.value)}
                      type="number"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="e.g., 8000"
                    />
                  </div>
                  <div>
                    <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                      <i className="fas fa-vault text-orange-600"></i> Security Deposit (৳) *
                    </label>
                    <input
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      type="number"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="e.g., 16000"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                    <i className="fas fa-lightbulb text-yellow-600"></i> Utilities (Monthly) (৳) - Optional
                  </label>
                  <input
                    value={utilities}
                    onChange={(e) => setUtilities(e.target.value)}
                    type="number"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="e.g., 500 (electricity, water, gas)"
                  />
                </div>

                {rent && deposit && (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700 mb-2"><strong>Summary:</strong></p>
                    <p className="text-gray-700">Monthly: ৳{parseInt(rent) + (utilities ? parseInt(utilities) : 0)} | Deposit: ৳{deposit}</p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Property Details */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-purple-200">
                  <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <h2 className="text-2xl font-bold text-gray-800">Property Details</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                      <i className="fas fa-door-open text-blue-600"></i> Number of Rooms *
                    </label>
                    <select
                      value={rooms}
                      onChange={(e) => setRooms(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                      <i className="fas fa-users text-green-600"></i> Total Capacity *
                    </label>
                    <select
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                      <i className="fas fa-venus-mars text-pink-600"></i> Gender Allowed *
                    </label>
                    <select
                      value={genderAllowed}
                      onChange={(e) => setGenderAllowed(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="both">Mixed (Any gender)</option>
                      <option value="male">Male Only</option>
                      <option value="female">Female Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex text-sm font-semibold mb-3 text-gray-800 items-center gap-2">
                      <i className="fas fa-couch text-amber-600"></i> Furnishing *
                    </label>
                    <select
                      value={furnished}
                      onChange={(e) => setFurnished(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi">Semi-Furnished</option>
                      <option value="furnished">Fully Furnished</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Amenities & Photos */}
            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-orange-200">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <h2 className="text-2xl font-bold text-gray-800">Amenities & Photos</h2>
                </div>

                {/* Amenities Section */}
                <div>
                  <label className="flex text-sm font-semibold mb-4 text-gray-800 items-center gap-2">
                    <i className="fas fa-star text-yellow-500"></i> Select Amenities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {amenityOptions.map(({ id, label, icon }) => (
                      <div
                        key={id}
                        onClick={() => toggleAmenity(id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition flex flex-col items-center gap-2 ${
                          amenities[id]
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={amenities[id]}
                          onChange={() => toggleAmenity(id)}
                          className="w-5 h-5 cursor-pointer accent-blue-600"
                        />
                        <i className={`fas ${icon} text-lg`}></i>
                        <span className="text-xs font-semibold text-center">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photos Section */}
                <div>
                  <label className="flex text-sm font-semibold mb-4 text-gray-800 items-center gap-2">
                    <i className="fas fa-image text-indigo-600"></i> Cover Photo URL *
                  </label>
                  <input
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <i className="fas fa-lightbulb text-yellow-500"></i> Provide a high-quality external image URL
                  </p>
                </div>

                <div>
                  <label className="flex text-sm font-semibold mb-4 text-gray-800 items-center gap-2">
                    <i className="fas fa-images text-indigo-600"></i> Additional Photos (Optional)
                  </label>
                  <div className="space-y-2">
                    {additionalPhotos.map((photo, idx) => (
                      <input
                        key={idx}
                        value={photo}
                        onChange={(e) => {
                          const newPhotos = [...additionalPhotos];
                          newPhotos[idx] = e.target.value;
                          setAdditionalPhotos(newPhotos);
                        }}
                        placeholder={`Photo ${idx + 2} URL (optional)`}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    ))}
                  </div>
                </div>

                {/* Final Review */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-check-circle text-green-600"></i> Review Your Listing
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p><strong>Type:</strong> {type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}</p>
                    <p><strong>City:</strong> {city}</p>
                    <p><strong>Rooms:</strong> {rooms}</p>
                    <p><strong>Capacity:</strong> {capacity}</p>
                    <p><strong>Rent:</strong> ৳{rent}</p>
                    <p><strong>Amenities:</strong> {Object.values(amenities).filter(Boolean).length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-8 mt-8 border-t-2 border-gray-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold flex items-center justify-center gap-2 transition"
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg font-semibold flex items-center justify-center gap-2 transition"
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold flex items-center justify-center gap-2 transition"
                >
                  <i className="fas fa-check-circle"></i> {loading ? 'Creating...' : 'Create Listing'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg shadow">
            <i className="fas fa-info-circle text-blue-600 text-2xl mb-2"></i>
            <p className="text-sm text-gray-700"><strong>Detailed Info</strong> helps attract quality students</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <i className="fas fa-image text-orange-600 text-2xl mb-2"></i>
            <p className="text-sm text-gray-700"><strong>Good Photos</strong> increase bookings</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <i className="fas fa-price-tag text-green-600 text-2xl mb-2"></i>
            <p className="text-sm text-gray-700"><strong>Competitive Price</strong> gets more inquiries</p>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default CreateListingPage;
