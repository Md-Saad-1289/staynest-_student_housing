import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listingService } from '../services/api';
import { ConfirmModal } from '../components/Dashboard/ConfirmModal';

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-center justify-between sticky top-0">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Toast Notification Component
const Toast = ({ message, type = 'success', onClose }) => {
  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fadeIn`}>
      <i className={`fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 hover:bg-black/20 rounded-full p-1">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  // Form state with field-level errors
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    furnished: 'semi-furnished',
    price: '',
    rooms: [],
    utilities: [],
    amenities: {},
    meals: { breakfast: false, lunch: false, dinner: false },
    photos: []
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showBedModal, setShowBedModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingBed, setEditingBed] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(isEditing);

  // Room/Bed modal state
  const [roomData, setRoomData] = useState({
    name: '',
    type: 'single',
    beds: []
  });

  const [bedData, setBedData] = useState({
    name: '',
    price: '',
    available: true,
    images: []
  });

  // Validation functions
  const validateField = useCallback((field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Title is required';
        } else if (value.length < 5) {
          newErrors.title = 'Title must be at least 5 characters';
        } else {
          delete newErrors.title;
        }
        break;

      case 'description':
        if (!value.trim()) {
          newErrors.description = 'Description is required';
        } else if (value.length < 20) {
          newErrors.description = 'Description must be at least 20 characters';
        } else {
          delete newErrors.description;
        }
        break;

      case 'location':
        if (!value.trim()) {
          newErrors.location = 'Location is required';
        } else {
          delete newErrors.location;
        }
        break;

      case 'price':
        const priceNum = parseFloat(value);
        if (!value || isNaN(priceNum) || priceNum <= 0) {
          newErrors.price = 'Please enter a valid price greater than 0';
        } else {
          delete newErrors.price;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors]);

  const validateStep = useCallback((step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.location.trim()) newErrors.location = 'Location is required';
        break;

      case 2:
        const priceNum = parseFloat(formData.price);
        if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
          newErrors.price = 'Please enter a valid price greater than 0';
        }
        break;

      case 3:
        if (formData.rooms.length === 0) {
          newErrors.rooms = 'At least one room is required';
        }
        break;

      case 4:
        if (formData.photos.length === 0) {
          newErrors.photos = 'At least one photo is required';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Memoized calculations
  const calculateRoomStats = useMemo(() => {
    const totalRooms = formData.rooms.length;
    const totalBeds = formData.rooms.reduce((sum, room) => sum + room.beds.length, 0);
    const availableBeds = formData.rooms.reduce((sum, room) =>
      sum + room.beds.filter(bed => bed.available).length, 0
    );
    const totalPrice = formData.rooms.reduce((sum, room) =>
      sum + room.beds.reduce((bedSum, bed) => bedSum + (parseFloat(bed.price) || 0), 0), 0
    );

    return { totalRooms, totalBeds, availableBeds, totalPrice };
  }, [formData.rooms]);

  // Load existing listing for editing
  useEffect(() => {
    if (isEditing) {
      const loadListing = async () => {
        try {
          const response = await listingService.getListingById(id);
          const listing = response.data;

          setFormData({
            title: listing.title || '',
            description: listing.description || '',
            location: listing.location || '',
            furnished: listing.furnished || 'semi-furnished',
            price: listing.price?.toString() || '',
            rooms: listing.rooms || [],
            utilities: listing.utilities || [],
            amenities: listing.amenities || {},
            meals: listing.meals || { breakfast: false, lunch: false, dinner: false },
            photos: listing.photos || []
          });
        } catch (error) {
          setToast({ message: 'Failed to load listing', type: 'error' });
        } finally {
          setLoading(false);
        }
      };

      loadListing();
    }
  }, [id, isEditing]);

  // Form handlers
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  }, [currentStep, validateStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        rooms: formData.rooms.map(room => ({
          ...room,
          id: room.id || `room_${Date.now()}_${Math.random()}`,
          beds: room.beds.map(bed => ({
            ...bed,
            id: bed.id || `bed_${Date.now()}_${Math.random()}`,
            price: parseFloat(bed.price)
          }))
        }))
      };

      if (isEditing) {
        await listingService.updateListing(id, submitData);
        setToast({ message: 'Listing updated successfully!', type: 'success' });
      } else {
        await listingService.createListing(submitData);
        setToast({ message: 'Listing created successfully!', type: 'success' });
      }

      setTimeout(() => {
        navigate('/dashboard/owner');
      }, 2000);

    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Failed to save listing',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEditing, id, validateStep, navigate]);

  // Room management
  const handleAddRoom = useCallback(() => {
    setRoomData({ name: '', type: 'single', beds: [] });
    setEditingRoom(null);
    setShowRoomModal(true);
  }, []);

  const handleEditRoom = useCallback((room) => {
    setRoomData({ ...room });
    setEditingRoom(room);
    setShowRoomModal(true);
  }, []);

  const handleSaveRoom = useCallback(() => {
    if (!roomData.name.trim()) {
      setToast({ message: 'Room name is required', type: 'error' });
      return;
    }

    const roomId = roomData.id || `room_${Date.now()}_${Math.random()}`;
    const newRoom = { ...roomData, id: roomId };

    setFormData(prev => ({
      ...prev,
      rooms: editingRoom
        ? prev.rooms.map(r => r.id === editingRoom.id ? newRoom : r)
        : [...prev.rooms, newRoom]
    }));

    setShowRoomModal(false);
    setToast({ message: 'Room saved successfully!', type: 'success' });
  }, [roomData, editingRoom]);

  const handleDeleteRoom = useCallback((roomId) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== roomId)
    }));
    setToast({ message: 'Room deleted successfully!', type: 'success' });
  }, []);

  // Bed management
  const handleAddBed = useCallback((roomId) => {
    setBedData({ name: '', price: '', available: true, images: [] });
    setEditingBed(null);
    setShowBedModal(true);
  }, []);

  const handleEditBed = useCallback((bed) => {
    setBedData({ ...bed });
    setEditingBed(bed);
    setShowBedModal(true);
  }, []);

  const handleSaveBed = useCallback(() => {
    if (!bedData.name.trim()) {
      setToast({ message: 'Bed name is required', type: 'error' });
      return;
    }

    const priceNum = parseFloat(bedData.price);
    if (!bedData.price || isNaN(priceNum) || priceNum <= 0) {
      setToast({ message: 'Please enter a valid bed price', type: 'error' });
      return;
    }

    const bedId = bedData.id || `bed_${Date.now()}_${Math.random()}`;
    const newBed = { ...bedData, id: bedId, price: priceNum.toString() };

    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room =>
        room.id === editingBed?.roomId || room.id === roomData.id
          ? {
              ...room,
              beds: editingBed
                ? room.beds.map(b => b.id === editingBed.id ? newBed : b)
                : [...room.beds, newBed]
            }
          : room
      )
    }));

    setShowBedModal(false);
    setToast({ message: 'Bed saved successfully!', type: 'success' });
  }, [bedData, editingBed, roomData.id]);

  const handleDeleteBed = useCallback((roomId, bedId) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room =>
        room.id === roomId
          ? { ...room, beds: room.beds.filter(b => b.id !== bedId) }
          : room
      )
    }));
    setToast({ message: 'Bed deleted successfully!', type: 'success' });
  }, []);

  // Utility management
  const handleAddUtility = useCallback((utility) => {
    if (!formData.utilities.includes(utility)) {
      setFormData(prev => ({
        ...prev,
        utilities: [...prev.utilities, utility]
      }));
    }
  }, [formData.utilities]);

  const handleRemoveUtility = useCallback((utility) => {
    setFormData(prev => ({
      ...prev,
      utilities: prev.utilities.filter(u => u !== utility)
    }));
  }, []);

  // Amenity management
  const handleAmenityChange = useCallback((amenity, value) => {
    setFormData(prev => ({
      ...prev,
      amenities: { ...prev.amenities, [amenity]: value }
    }));
  }, []);

  // Photo management
  const handlePhotoUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    const newPhotos = files.map(file => ({
      id: `photo_${Date.now()}_${Math.random()}`,
      url: URL.createObjectURL(file),
      file
    }));

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  }, []);

  const handleRemovePhoto = useCallback((photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId)
    }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? 'Edit Listing' : 'Create New Listing'}
              </h1>
              <p className="text-gray-600 mt-1">
                Step {currentStep} of 4: {
                  currentStep === 1 ? 'Basic Information' :
                  currentStep === 2 ? 'Pricing & Details' :
                  currentStep === 3 ? 'Rooms & Beds' :
                  'Photos & Amenities'
                }
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/owner')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map(step => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Listing Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Comfortable Student Hostel in Dhanmondi"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your property, facilities, and what makes it special..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Dhanmondi, Dhaka"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnished Status
                </label>
                <select
                  value={formData.furnished}
                  onChange={(e) => handleInputChange('furnished', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="fully-furnished">Fully Furnished</option>
                  <option value="semi-furnished">Semi Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price (BDT) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 8000"
                  min="0"
                  step="100"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meals Included
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['breakfast', 'lunch', 'dinner'].map(meal => (
                    <label key={meal} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.meals[meal]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          meals: { ...prev.meals, [meal]: e.target.checked }
                        }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{meal}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Room Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Property Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{calculateRoomStats.totalRooms}</div>
                    <div className="text-sm text-gray-600">Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{calculateRoomStats.totalBeds}</div>
                    <div className="text-sm text-gray-600">Total Beds</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{calculateRoomStats.availableBeds}</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">৳{calculateRoomStats.totalPrice.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Value</div>
                  </div>
                </div>
              </div>

              {errors.rooms && (
                <p className="text-sm text-red-600">{errors.rooms}</p>
              )}

              {/* Rooms List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Rooms</h3>
                  <button
                    onClick={handleAddRoom}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Room
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.rooms.map(room => (
                    <div key={room.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{room.name}</h4>
                          <p className="text-sm text-gray-600 capitalize">{room.type} Room</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditRoom(room)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {room.beds.length} bed{room.beds.length !== 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => handleAddBed(room.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <i className="fas fa-plus mr-1"></i>
                          Add Bed
                        </button>
                      </div>

                      {/* Beds in this room */}
                      {room.beds.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {room.beds.map(bed => (
                            <div key={bed.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div>
                                <span className="text-sm font-medium">{bed.name}</span>
                                <span className="text-sm text-gray-600 ml-2">৳{bed.price}</span>
                                {!bed.available && (
                                  <span className="text-xs text-red-600 ml-2">(Occupied)</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEditBed({ ...bed, roomId: room.id })}
                                  className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteBed(room.id, bed.id)}
                                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Photos *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                    <p className="text-gray-600">Click to upload photos</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB each</p>
                  </label>
                </div>

                {formData.photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.photos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt="Property"
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                        <button
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.photos && (
                  <p className="mt-1 text-sm text-red-600">{errors.photos}</p>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    'WiFi', 'AC', 'Laundry', 'Parking', 'Security',
                    'Generator', 'Water Heater', 'Study Table', 'Cupboard'
                  ].map(amenity => (
                    <label key={amenity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.amenities[amenity] || false}
                        onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Utilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Utilities Included
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Electricity', 'Gas', 'Water', 'Internet'].map(utility => (
                    <button
                      key={utility}
                      onClick={() => formData.utilities.includes(utility)
                        ? handleRemoveUtility(utility)
                        : handleAddUtility(utility)
                      }
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.utilities.includes(utility)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {utility}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Previous
            </button>

            <div className="flex items-center gap-4">
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Next
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      {isEditing ? 'Update Listing' : 'Create Listing'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Room Modal */}
      <Modal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Name *
            </label>
            <input
              type="text"
              value={roomData.name}
              onChange={(e) => setRoomData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Room 101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type
            </label>
            <select
              value={roomData.type}
              onChange={(e) => setRoomData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
              <option value="dormitory">Dormitory</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => setShowRoomModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRoom}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {editingRoom ? 'Update Room' : 'Add Room'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bed Modal */}
      <Modal
        isOpen={showBedModal}
        onClose={() => setShowBedModal(false)}
        title={editingBed ? 'Edit Bed' : 'Add New Bed'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bed Name *
              </label>
              <input
                type="text"
                value={bedData.name}
                onChange={(e) => setBedData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Bed A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (BDT) *
              </label>
              <input
                type="number"
                value={bedData.price}
                onChange={(e) => setBedData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 8500"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bedData.available}
                onChange={(e) => setBedData(prev => ({ ...prev, available: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Available for booking</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bed Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setBedData(prev => ({
                    ...prev,
                    images: [...prev.images, ...files.map(file => ({
                      id: `img_${Date.now()}_${Math.random()}`,
                      url: URL.createObjectURL(file),
                      file
                    }))]
                  }));
                }}
                className="hidden"
                id="bed-image-upload"
              />
              <label htmlFor="bed-image-upload" className="cursor-pointer">
                <i className="fas fa-camera text-2xl text-gray-400 mb-2"></i>
                <p className="text-gray-600">Add bed photos</p>
              </label>
            </div>

            {bedData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {bedData.images.map(image => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt="Bed"
                      className="w-full h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                    <button
                      onClick={() => setBedData(prev => ({
                        ...prev,
                        images: prev.images.filter(img => img.id !== image.id)
                      }))}
                      className="absolute top-1 right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => setShowBedModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBed}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {editingBed ? 'Update Bed' : 'Add Bed'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleSubmit}
        title={isEditing ? 'Update Listing' : 'Create Listing'}
        message={`Are you sure you want to ${isEditing ? 'update' : 'create'} this listing?`}
        confirmText={isEditing ? 'Update' : 'Create'}
        isLoading={isSubmitting}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export { CreateListingPage };