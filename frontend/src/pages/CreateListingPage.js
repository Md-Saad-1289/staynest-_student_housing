import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listingService } from '../services/api';
import { ConfirmModal } from '../components/Dashboard/ConfirmModal';

export const CreateListingPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(isEditMode);
  
  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  
  // Meals
  const [mealsAvailable, setMealsAvailable] = useState(false);
  const [mealsType, setMealsType] = useState('none');
  
  // Pricing
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [utilities, setUtilities] = useState([]);
  
  // Room-wise bed management
  const [roomsList, setRoomsList] = useState([]);
  
  // Room modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);
  const [roomFormData, setRoomFormData] = useState({ name: '', type: 'Shared', description: '', images: [''] });
  
  // Bed modal states
  const [showBedModal, setShowBedModal] = useState(false);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(null);
  const [bedFormData, setBedFormData] = useState({ status: 'Available', rent: '', vacantDate: '', studentName: '', contact: '', advancePaid: false });
  const [editingBedIndex, setEditingBedIndex] = useState(null);

  // confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ open: false });

  const openConfirm = ({ title, message, confirmText = 'Confirm', isDangerous = false, onConfirm }) => {
    setConfirmModal({ open: true, title, message, confirmText, isDangerous, onConfirm });
  };

  const closeConfirm = () => setConfirmModal({ open: false });
  
  // Details
  const [genderAllowed, setGenderAllowed] = useState('both');
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
          setRules(listing.rules || '');
          setAddress(listing.address || '');
          setCity(listing.city || '');
          setType(listing.type || '');
          setRent(listing.rent?.toString() || '');
          setDeposit(listing.deposit?.toString() || '');
          setUtilities(listing.utilities || []);
          setGenderAllowed(listing.genderAllowed || 'both');
          if (Array.isArray(listing.rooms)) {
            setRoomsList(listing.rooms);
          } else {
            setRoomsList([]);
          }
          setFurnished(listing.furnished || 'semi');
          
          if (listing.meals) {
            setMealsAvailable(listing.meals.available || false);
            setMealsType(listing.meals.type || 'none');
          }
          
          if (listing.amenities) {
            setAmenities({
              wifi: listing.amenities.wifi || false,
              ac: listing.amenities.ac || false,
              parking: listing.amenities.parking || false,
              laundry: listing.amenities.laundry || false,
              kitchen: listing.amenities.kitchen || false,
              balcony: listing.amenities.balcony || false,
              security24: listing.amenities.security24 || false,
              gatekeeper: listing.amenities.gatekeeper || false,
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
  
  // Utility management functions
  const addUtility = () => {
    setUtilities([...utilities, { name: '', price: '' }]);
  };

  const removeUtility = (index) => {
    setUtilities(utilities.filter((_, i) => i !== index));
  };

  const handleUtilityChange = (index, field, value) => {
    const newUtilities = [...utilities];
    newUtilities[index] = { ...newUtilities[index], [field]: value };
    setUtilities(newUtilities);
  };

  // Calculate total utilities
  const totalUtilities = utilities.reduce((sum, util) => {
    return sum + (parseFloat(util.price) || 0);
  }, 0);

  const totalMonthly = (parseFloat(rent) || 0) + totalUtilities;

  // Room Management Functions
  const addRoom = () => {
    const newRoom = {
      name: `Room ${roomsList.length + 1}`,
      type: 'Shared',
      description: '',
      images: [''],
      beds: []
    };
    setRoomsList([...roomsList, newRoom]);
  };

  const updateRoom = (index, updatedRoom) => {
    const newRooms = [...roomsList];
    newRooms[index] = { ...newRooms[index], ...updatedRoom };
    setRoomsList(newRooms);
  };

  const deleteRoom = (index) => {
    openConfirm({
      title: 'Delete Room',
      message: 'Are you sure you want to delete this room and all its beds?',
      confirmText: 'Delete',
      isDangerous: true,
      onConfirm: () => {
        setRoomsList(roomsList.filter((_, i) => i !== index));
        closeConfirm();
      }
    });
  };

  const openRoomModal = (index = null) => {
    if (index !== null) {
      setEditingRoomIndex(index);
      const room = roomsList[index];
      setRoomFormData({ name: room.name, type: room.type, description: room.description, images: room.images || [''] });
    } else {
      setEditingRoomIndex(null);
      setRoomFormData({ name: '', type: 'Shared', description: '', images: [''] });
    }
    setShowRoomModal(true);
  };

  const saveRoom = () => {
    if (!roomFormData.name.trim()) {
      setError('Room name is required');
      return;
    }
    if (editingRoomIndex !== null) {
      updateRoom(editingRoomIndex, roomFormData);
    } else {
      const newRoom = {
        ...roomFormData,
        beds: []
      };
      setRoomsList([...roomsList, newRoom]);
    }
    setShowRoomModal(false);
    setError('');
  };

  const openBedModal = (roomIndex, bedIndex = null) => {
    setSelectedRoomIndex(roomIndex);
    if (bedIndex !== null) {
      setEditingBedIndex(bedIndex);
      const bed = roomsList[roomIndex].beds[bedIndex];
      setBedFormData({ ...bed });
    } else {
      setEditingBedIndex(null);
      setBedFormData({ status: 'Available', rent: '', vacantDate: '', studentName: '', contact: '', advancePaid: false });
    }
    setShowBedModal(true);
  };

  const saveBed = () => {
    if (!bedFormData.rent || isNaN(bedFormData.rent)) {
      setError('Bed rent must be a valid number');
      return;
    }
    if (bedFormData.status === 'Booked' && !bedFormData.studentName.trim()) {
      setError('Student name is required for booked beds');
      return;
    }
    if (bedFormData.status === 'Vacant' && !bedFormData.vacantDate) {
      setError('Vacant date is required');
      return;
    }
    
    const newRooms = [...roomsList];
    const beds = newRooms[selectedRoomIndex].beds || [];
    
    if (editingBedIndex !== null) {
      beds[editingBedIndex] = bedFormData;
    } else {
      const bedNumber = beds.length + 1;
      beds.push({ ...bedFormData, bedNumber });
    }
    
    newRooms[selectedRoomIndex].beds = beds;
    setRoomsList(newRooms);
    setShowBedModal(false);
    setError('');
  };

  const deleteBed = (roomIndex, bedIndex) => {
    openConfirm({
      title: 'Delete Bed',
      message: 'Are you sure you want to delete this bed?',
      confirmText: 'Delete',
      isDangerous: true,
      onConfirm: () => {
        const newRooms = [...roomsList];
        newRooms[roomIndex].beds = newRooms[roomIndex].beds.filter((_, i) => i !== bedIndex);
        setRoomsList(newRooms);
        closeConfirm();
      }
    });
  };

  // Room Statistics
  const calculateRoomStats = () => {
    let totalBeds = 0;
    let bookedBeds = 0;
    let expectedRevenue = 0;

    roomsList.forEach(room => {
      room.beds.forEach(bed => {
        totalBeds += 1;
        expectedRevenue += parseFloat(bed.rent) || 0;
        if (bed.status === 'Booked') bookedBeds += 1;
      });
    });

    const occupancy = totalBeds > 0 ? Math.round((bookedBeds / totalBeds) * 100) : 0;
    return { totalBeds, bookedBeds, occupancy, expectedRevenue };
  };

  // compute room statistics on each render
  const roomStats = calculateRoomStats();

  const validateStep = (currentStep) => {
    setError('');
    if (currentStep === 1) {
      if (!title.trim() || !description.trim() || !address.trim() || !city.trim() || !type || !genderAllowed || !furnished) {
        setError('Step 1: Please fill all required fields');
        return false;
      }
    } else if (currentStep === 2) {
      if (!rent || !deposit) {
        setError('Step 2: Please enter rent and deposit');
        return false;
      }
    } else if (currentStep === 3) {
      if (roomsList.length === 0) {
        setError('Step 3: Please add at least one room with beds');
        return false;
      }
      const hasBedsInAllRooms = roomsList.every(room => room.beds && room.beds.length > 0);
      if (!hasBedsInAllRooms) {
        setError('Step 3: Each room must have at least one bed');
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

    const amenitiesObj = {};
    Object.keys(amenities).forEach((k) => {
      if (amenities[k]) amenitiesObj[k] = true;
    });

    const payload = {
      title,
      description,
      rules,
      address,
      city,
      type,
      rent: parseFloat(rent),
      deposit: parseFloat(deposit),
      utilities: utilities.filter(u => u.name && u.price).map(u => ({
        name: u.name,
        price: parseFloat(u.price)
      })),
      genderAllowed,
      rooms: roomsList.map(room => ({
        name: room.name,
        type: room.type,
        description: room.description,
        images: room.images ? room.images.filter(img => img.trim()) : [],
        beds: room.beds ? room.beds.map(bed => ({
          bedNumber: bed.bedNumber,
          rent: parseFloat(bed.rent),
          status: bed.status,
          vacantDate: bed.vacantDate || null,
          studentName: bed.studentName || null,
          contact: bed.contact || null,
          advancePaid: bed.advancePaid || false
        })) : []
      })),
      furnished,
      amenities: amenitiesObj,
      meals: {
        available: mealsAvailable,
        type: mealsType,
      },
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

  // Room Modal Component
  const RoomModal = () => {
    if (!showRoomModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-center justify-between sticky top-0">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <i className="fas fa-door-open"></i>
              {editingRoomIndex !== null ? 'Edit Room' : 'Add New Room'}
            </h2>
            <button
              onClick={() => setShowRoomModal(false)}
              className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">Room Name *</label>
              <input
                value={roomFormData.name}
                onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                placeholder="e.g., Room A, Room 101, Master Bedroom"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">Room Type *</label>
              <select
                value={roomFormData.type}
                onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              >
                <option value="Single">Single</option>
                <option value="Shared">Shared</option>
                <option value="AC">AC</option>
                <option value="Non-AC">Non-AC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">Room Description</label>
              <textarea
                value={roomFormData.description}
                onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                placeholder="Describe the room, furniture, amenities, etc..."
                rows="3"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">Room Image URL</label>
              <input
                value={roomFormData.images[0]}
                onChange={(e) => setRoomFormData({ ...roomFormData, images: [e.target.value] })}
                placeholder="https://example.com/room-image.jpg"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              />
              {roomFormData.images[0] && (
                <img
                  src={roomFormData.images[0]}
                  alt="room preview"
                  className="mt-3 h-32 object-cover rounded-lg border"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowRoomModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRoom}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg hover:shadow-lg font-semibold transition"
              >
                <i className="fas fa-save mr-2"></i> Save Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Bed Modal Component
  const BedModal = () => {
    if (!showBedModal) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between sticky top-0">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <i className="fas fa-bed"></i>
              {editingBedIndex !== null ? 'Edit Bed' : 'Add New Bed'}
            </h2>
            <button
              onClick={() => setShowBedModal(false)}
              className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">Rent (৳) *</label>
              <input
                type="number"
                value={bedFormData.rent}
                onChange={(e) => setBedFormData({ ...bedFormData, rent: e.target.value })}
                placeholder="e.g., 8000"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-800">Bed Status *</label>
              <select
                value={bedFormData.status}
                onChange={(e) => setBedFormData({ ...bedFormData, status: e.target.value })}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Vacant">Vacant from date</option>
              </select>
            </div>

            {bedFormData.status === 'Booked' && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800">Student Name *</label>
                  <input
                    value={bedFormData.studentName}
                    onChange={(e) => setBedFormData({ ...bedFormData, studentName: e.target.value })}
                    placeholder="Full name of the student"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-800">Contact Number</label>
                  <input
                    value={bedFormData.contact}
                    onChange={(e) => setBedFormData({ ...bedFormData, contact: e.target.value })}
                    placeholder="e.g., +880123456789"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={bedFormData.advancePaid}
                    onChange={(e) => setBedFormData({ ...bedFormData, advancePaid: e.target.checked })}
                    className="w-5 h-5 text-blue-600 cursor-pointer"
                  />
                  <label className="text-sm font-semibold text-gray-800 cursor-pointer">Advance Paid</label>
                </div>
              </>
            )}

            {bedFormData.status === 'Vacant' && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-800">Vacant From Date *</label>
                <input
                  type="date"
                  value={bedFormData.vacantDate}
                  onChange={(e) => setBedFormData({ ...bedFormData, vacantDate: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowBedModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveBed}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:shadow-lg font-semibold transition"
              >
                <i className="fas fa-save mr-2"></i> Save Bed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
                  {['Basic Info', 'Pricing', 'Rooms & Beds', 'Amenities'][num - 1]}
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
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
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
                    placeholder="Describe your property, nearby areas, etc..."
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
                          <option value="Rangpur">Rangpur</option>
                          <option value="Mymensingh">Mymensingh</option>

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
                          <option value="apartment">Apartment</option>
                          <option value="shared">Shared House</option>
                          <option value="sublet">Sublet</option>
                          <option value="other">Other</option>
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
                      <i className="fas fa-couch text-orange-600"></i> Furnished *
                    </label>
                    <select
                      value={furnished}
                      onChange={(e) => setFurnished(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    >
                      <option value="fully">Fully Furnished</option>
                      <option value="semi">Semi Furnished</option>
                      <option value="none">Not Furnished</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

           {/* STEP 2: Pricing */}
{step === 2 && (
  <div className="space-y-8 animate-fadeIn">

    <div className="flex items-center gap-3 pb-4 border-b-2 border-green-200">
      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
        2
      </div>
      <h2 className="text-2xl font-bold text-gray-800">
        Pricing Details
      </h2>
    </div>

    {/* Info Box */}
    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
      <p className="text-green-700 font-semibold flex items-center gap-2">
        <i className="fas fa-lightbulb"></i>
        Transparent pricing builds trust & increases booking rate
      </p>
    </div>

    {/* Rent + Deposit */}
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <label className="block text-sm font-semibold mb-3">
          Monthly Rent (৳) *
        </label>
        <input
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          type="number"
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
          placeholder="e.g., 5000"
        />
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <label className="block text-sm font-semibold mb-3">
          Security Deposit (৳) *
        </label>
        <input
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
          type="number"
          min={300}
          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
          placeholder="e.g., 3000"
        />
      </div>
    </div>

    {/* Utilities Section */}
    <div className="bg-gray-50 p-6 rounded-xl border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Utilities (Optional)</h3>
        <button
          type="button"
          onClick={addUtility}
          className="text-green-600 font-semibold hover:underline"
        >
          + Add Utility
        </button>
      </div>

      {utilities.map((utility, index) => (
        <div key={index} className="grid md:grid-cols-5 gap-3 mb-3 items-center">
          <input
            type="text"
            placeholder="Utility Name (Electricity, Water, WiFi)"
            value={utility.name}
            onChange={(e) =>
              handleUtilityChange(index, "name", e.target.value)
            }
            className="md:col-span-3 border rounded-lg px-3 py-2"
          />

          <input
            type="number"
            placeholder="Price (৳)"
            value={utility.price}
            onChange={(e) =>
              handleUtilityChange(index, "price", e.target.value)
            }
            className="md:col-span-1 border rounded-lg px-3 py-2"
          />

          <button
            type="button"
            onClick={() => removeUtility(index)}
            className="text-red-500 font-bold hover:text-red-700"
          >
            ✕
          </button>
        </div>
      ))}
    </div>

    {/* Smart Summary */}
    {(rent || totalUtilities) && (
      <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
        <p className="font-semibold mb-3 text-gray-800">
          Cost Breakdown
        </p>

        <div className="space-y-1 text-gray-700">
          <p>Base Rent: ৳{rent || 0}</p>
          <p>Total Utilities: ৳{totalUtilities}</p>
          <p className="font-bold text-lg text-blue-700">
            Total Monthly: ৳{totalMonthly}
          </p>
          <p>Security Deposit: ৳{deposit || 0}</p>
        </div>
      </div>
    )}

  </div>
)}
            {/* STEP 3: Room & Bed Management */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <h2 className="text-2xl font-bold text-gray-800">Room & Bed Management</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addRoom}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2 font-semibold"
                  >
                    <i className="fas fa-plus"></i> Add Room
                  </button>
                </div>

                {/* Info Box */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                  <p className="text-purple-700 font-semibold flex items-center gap-2">
                    <i className="fas fa-lightbulb"></i>
                    Define individual rooms and beds with pricing, status, and student details
                  </p>
                </div>

                {/* Room Stats Summary */}
                {roomsList.length > 0 && (() => {
                  const stats = calculateRoomStats();
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-700 font-semibold">Total Beds</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalBeds}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                        <p className="text-sm text-green-700 font-semibold">Booked Beds</p>
                        <p className="text-3xl font-bold text-green-600">{stats.bookedBeds}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                        <p className="text-sm text-orange-700 font-semibold">Occupancy</p>
                        <p className="text-3xl font-bold text-orange-600">{stats.occupancy}%</p>
                      </div>
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                        <p className="text-sm text-indigo-700 font-semibold">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-indigo-600">৳{stats.expectedRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Rooms Grid */}
                {roomsList.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
                    <i className="fas fa-door-open text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-600 font-semibold text-lg">No rooms added yet</p>
                    <p className="text-gray-500">Click "Add Room" to start managing your rooms and beds</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roomsList.map((room, roomIndex) => (
                      <div key={roomIndex} className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition">
                        {/* Room Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{room.name}</h3>
                            <p className="text-sm text-purple-200">{room.type} • {room.beds ? room.beds.length : 0} beds</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openRoomModal(roomIndex)}
                              className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded transition"
                              title="Edit room"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRoom(roomIndex)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-white px-3 py-2 rounded transition"
                              title="Delete room"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>

                        {/* Room Description */}
                        {room.description && (
                          <div className="bg-gray-50 px-4 py-2 border-b text-sm text-gray-600">
                            {room.description}
                          </div>
                        )}

                        {/* Beds Grid */}
                        <div className="p-4">
                          {room.beds && room.beds.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                              {room.beds.map((bed, bedIndex) => {
                                let statusColor = 'bg-green-100 text-green-800 border-green-300';
                                let statusIcon = 'fa-check-circle';
                                if (bed.status === 'Booked') {
                                  statusColor = 'bg-red-100 text-red-800 border-red-300';
                                  statusIcon = 'fa-times-circle';
                                } else if (bed.status === 'Vacant') {
                                  statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                                  statusIcon = 'fa-clock';
                                }

                                return (
                                  <div
                                    key={bedIndex}
                                    onClick={() => openBedModal(roomIndex, bedIndex)}
                                    className={`cursor-pointer border-2 ${statusColor} rounded-lg p-3 hover:shadow-md transition text-center`}
                                  >
                                    <p className="font-bold text-sm">Bed {bed.bedNumber}</p>
                                    <p className="text-xs font-semibold mb-1 flex items-center justify-center gap-1">
                                      <i className={`fas ${statusIcon} text-xs`}></i>
                                      {bed.status}
                                    </p>
                                    <p className="text-xs font-bold">৳{bed.rent}</p>
                                    {bed.status === 'Booked' && bed.studentName && (
                                      <p className="text-xs text-gray-600 truncate mt-1">{bed.studentName}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mb-4 italic">No beds added yet</p>
                          )}

                          <button
                            type="button"
                            onClick={() => openBedModal(roomIndex)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2"
                          >
                            <i className="fas fa-plus"></i> Add Bed
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

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

                {/* Image Previews */}
                <div className="mt-4">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Preview</label>
                  <div className="flex items-center gap-3">
                    {photoUrl ? (
                      <img src={photoUrl} alt="cover" className="w-28 h-20 object-cover rounded-lg border" onError={(e)=>{e.target.style.display='none'}} />
                    ) : (
                      <div className="w-28 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500">No cover</div>
                    )}
                    <div className="flex gap-2">
                      {additionalPhotos.map((p, i) => (
                        p ? (
                          <img key={i} src={p} alt={`photo-${i}`} className="w-20 h-14 object-cover rounded-md border" onError={(e)=>{e.target.style.display='none'}} />
                        ) : (
                          <div key={i} className="w-20 h-14 bg-gray-50 rounded-md border flex items-center justify-center text-xs text-gray-400">Empty</div>
                        )
                      ))}
                    </div>
                  </div>
                </div>

                {/* Final Review */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <i className="fas fa-check-circle text-green-600"></i> Review Your Listing
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p><strong>Type:</strong> {type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}</p>
                    </div>
                    <div>
                      <p><strong>City:</strong> {city}</p>
                    </div>
                    <div>
                      <p><strong>Total Rooms:</strong> {roomsList.length}</p>
                    </div>
                    <div>
                      <p><strong>Total Beds:</strong> {roomStats.totalBeds}</p>
                    </div>
                    <div>
                      <p><strong>Booked Beds:</strong> {roomStats.bookedBeds}</p>
                    </div>
                    <div>
                      <p><strong>Occupancy:</strong> {roomStats.occupancy}%</p>
                    </div>
                    <div>
                      <p><strong>Monthly Revenue:</strong> ৳{roomStats.expectedRevenue.toLocaleString()}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p><strong>Amenities:</strong> {Object.values(amenities).filter(Boolean).length}</p>
                    </div>
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
                  <i className="fas fa-check-circle"></i> {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Listing' : 'Create Listing')}
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

        {/* Room Modal */}
        <RoomModal />

        {/* Bed Modal */}
        <BedModal />

        {/* Confirm Modal */}
        <ConfirmModal
          isOpen={confirmModal.open}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          isDangerous={confirmModal.isDangerous}
          onConfirm={confirmModal.onConfirm}
          onCancel={closeConfirm}
        />
        </>
        )}
      </div>
    </div>
  );
};

export default CreateListingPage;
