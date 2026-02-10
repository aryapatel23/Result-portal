import React, { useState, useEffect } from 'react';
import { MapPin, Clock, User, CheckCircle, AlertTriangle, UserCheck, Navigation, Loader2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import AttendanceTestModal from './AttendanceTestModal';

const TeacherMarkAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [status, setStatus] = useState('Present');
  const [location, setLocation] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [distanceFromSchool, setDistanceFromSchool] = useState(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
  
  // School location from environment variables  
  const SCHOOL_LOCATION = {
    latitude: parseFloat(import.meta.env.VITE_SCHOOL_LATITUDE) || 22.81713251852116,
    longitude: parseFloat(import.meta.env.VITE_SCHOOL_LONGITUDE) || 72.47335209589137,
    maxDistance: parseFloat(import.meta.env.VITE_SCHOOL_ATTENDANCE_RADIUS_KM) || 3
  };

  // Check today's attendance status on component mount
  useEffect(() => {
    checkTodayStatus();
    getCurrentLocation(); // Auto-fetch location on load
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const checkTodayStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/teacher-attendance/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTodayAttendance(data.attendance);
      }
    } catch (error) {
      console.error('Error checking today status:', error);
    }
  };

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setLocation(newLocation);
        
        // Calculate distance from school
        const distance = calculateDistance(
          newLocation.latitude,
          newLocation.longitude,
          SCHOOL_LOCATION.latitude,
          SCHOOL_LOCATION.longitude
        );
        
        setDistanceFromSchool(distance);
        setLoadingLocation(false);
        
        if (distance <= SCHOOL_LOCATION.maxDistance) {
          toast.success(`Location verified! You are ${distance.toFixed(2)}km from school.`);
        } else {
          toast.error(`You are ${distance.toFixed(2)}km from school. You must be within ${SCHOOL_LOCATION.maxDistance}km to mark attendance.`);
        }
      },
      (error) => {
        setLoadingLocation(false);
        let errorMessage = 'Unable to get location: ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Permission denied. Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Position unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Request timeout.';
            break;
          default:
            errorMessage += 'Unknown error.';
            break;
        }
        
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache location for 1 minute
      }
    );
  };

  const submitAttendance = async (e) => {
    e.preventDefault();
    
    if (status !== 'Leave' && (!location || distanceFromSchool > SCHOOL_LOCATION.maxDistance)) {
      toast.error(`You must be within ${SCHOOL_LOCATION.maxDistance}km of school to mark attendance`);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher-attendance/mark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          location,
          remarks
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setTodayAttendance(data.attendance);
        setRemarks('');
        // Auto refresh location for next use
        getCurrentLocation();
      } else {
        toast.error(data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user can mark attendance (within 3km or status is Leave)
  const canMarkAttendance = () => {
    if (status === 'Leave') return true;
    return location && distanceFromSchool !== null && distanceFromSchool <= SCHOOL_LOCATION.maxDistance;
  };

  const getLocationStatusColor = () => {
    if (!location) return 'text-gray-500';
    if (distanceFromSchool === null) return 'text-gray-500';
    return distanceFromSchool <= SCHOOL_LOCATION.maxDistance ? 'text-green-600' : 'text-red-600';
  };

  const getLocationStatusIcon = () => {
    if (loadingLocation) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (!location) return <MapPin className="w-5 h-5" />;
    return distanceFromSchool <= SCHOOL_LOCATION.maxDistance ? 
      <CheckCircle className="w-5 h-5" /> : 
      <AlertTriangle className="w-5 h-5" />;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Attendance</h1>
                <p className="text-gray-600">Mark your daily attendance with location verification</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowDebugModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Debug & Test Connection"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Today's Status Card */}
          {todayAttendance && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Attendance Already Marked</h3>
                    <p className="text-green-600">
                      Status: {todayAttendance.status} • Time: {formatTime(todayAttendance.checkInTime)}
                    </p>
                    {todayAttendance.location && (
                      <p className="text-green-600 text-sm">
                        Location: {todayAttendance.location.address}
                      </p>
                    )}
                    {todayAttendance.remarks && (
                      <p className="text-green-600 text-sm">
                        Remarks: {todayAttendance.remarks}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!todayAttendance && (
            <>
              {/* Location Status Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location Verification
                  </h3>
                  <button
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingLocation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    {loadingLocation ? 'Getting Location...' : 'Get Location'}
                  </button>
                </div>

                <div className={`flex items-center gap-2 ${getLocationStatusColor()}`}>
                  {getLocationStatusIcon()}
                  <span className="font-medium">
                    {loadingLocation && 'Getting your location...'}
                    {!loadingLocation && !location && 'Location not detected'}
                    {!loadingLocation && locationError && locationError}
                    {location && distanceFromSchool !== null && (
                      <>
                        Distance from school: {distanceFromSchool.toFixed(2)}km 
                        {distanceFromSchool <= SCHOOL_LOCATION.maxDistance ? 
                          ' (Within allowed range)' : 
                          ` (Must be within ${SCHOOL_LOCATION.maxDistance}km)`
                        }
                      </>
                    )}
                  </span>
                </div>

                {location && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Latitude: </span>
                      {location.latitude.toFixed(6)}
                    </div>
                    <div>
                      <span className="font-medium">Longitude: </span>
                      {location.longitude.toFixed(6)}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Accuracy: </span>
                      {location.accuracy ? `±${location.accuracy.toFixed(0)}m` : 'N/A'}
                    </div>
                  </div>
                )}
              </div>

              {/* Attendance Form */}
              <form onSubmit={submitAttendance} className="space-y-6">
                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendance Status
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Present', 'Absent', 'Half-Day', 'Leave'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          status === s
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {status === 'Leave' && (
                    <p className="text-sm text-blue-600 mt-2">
                      📍 Location verification is not required for Leave status
                    </p>
                  )}
                </div>

                {/* Remarks */}
                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks (Optional)
                  </label>
                  <textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional notes..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !canMarkAttendance()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Marking Attendance...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5" />
                      Mark Attendance
                    </>
                  )}
                </button>

                {/* Location Status Warning */}
                {status !== 'Leave' && (!canMarkAttendance()) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">
                        {!location ? 'Please get your location to mark attendance' : 
                         `You must be within ${SCHOOL_LOCATION.maxDistance}km of school to mark attendance`}
                      </span>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}

          {/* School Information */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              School Location Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Latitude: </span>
                {SCHOOL_LOCATION.latitude}
              </div>
              <div>
                <span className="font-medium">Longitude: </span>
                {SCHOOL_LOCATION.longitude}
              </div>
              <div>
                <span className="font-medium">Allowed Radius: </span>
                {SCHOOL_LOCATION.maxDistance}km
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Mark Attendance</h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-800">1.</span>
                Allow location access when prompted by your browser
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-800">2.</span>
                Make sure you are within 3km of the school location
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-800">3.</span>
                Select your attendance status (Present, Absent, Half-Day, or Leave)
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-800">4.</span>
                Add remarks if needed and click "Mark Attendance"
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-800">Note:</span>
                Location verification is not required for "Leave" status
              </li>
            </ul>
          </div>

          {/* Requirements Checklist */}
          <div className="mt-6 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Requirements Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Attendance Status Selected</span>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Location Verification</span>
                {status === 'Leave' ? (
                  <div className="flex items-center gap-1 text-blue-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Not Required</span>
                  </div>
                ) : location && distanceFromSchool <= SCHOOL_LOCATION.maxDistance ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Debug Modal */}
        <AttendanceTestModal 
          isOpen={showDebugModal} 
          onClose={() => setShowDebugModal(false)} 
        />
      </div>
    </div>
  );
};

export default TeacherMarkAttendance;