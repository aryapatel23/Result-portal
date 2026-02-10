import React, { useState, useEffect } from 'react';
import { X, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceTestModal = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState({});

  useEffect(() => {
    setConfig({
      SCHOOL_LATITUDE: import.meta.env.VITE_SCHOOL_LATITUDE,
      SCHOOL_LONGITUDE: import.meta.env.VITE_SCHOOL_LONGITUDE,
      RADIUS: import.meta.env.VITE_SCHOOL_ATTENDANCE_RADIUS_KM,
      API_URL: import.meta.env.VITE_API_URL
    });
  }, []);

  const testBackendConnection = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher-attendance/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('✅ Backend connection successful!');
        console.log('Backend response:', data);
      } else {
        toast.error(`❌ Backend error: ${response.status}`);
      }
    } catch (error) {
      toast.error('❌ Network error: ' + error.message);
      console.error('Connection error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Attendance System Debug</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Environment Variables:</h4>
            <div className="text-sm space-y-1 bg-gray-50 p-3 rounded">
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-mono text-xs">{key}:</span>
                  <span className="font-mono text-xs">{value || 'undefined'}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={testBackendConnection}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Test Backend Connection
          </button>

          <div className="text-xs text-gray-500">
            <p>• Check console for detailed logs</p>
            <p>• Ensure backend is running on port 5000</p>
            <p>• Verify JWT token in localStorage</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTestModal;