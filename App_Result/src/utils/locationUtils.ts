/**
 * Location Utilities for React Native
 * 
 * Ported from web portal to ensure consistent attendance logic.
 */

// School coordinates aligned with backend defaults
const SCHOOL_LAT = 22.81713251852116;
const SCHOOL_LON = 72.47335209589137;
const ALLOWED_RADIUS = 3.0; // 3km

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Check if user is within school range
 * In a real mobile app, we would use a library like react-native-geolocation-service
 * For this implementation, we simulate GPS values or use provided ones.
 */
export const checkLocationAccess = async (userLat: number, userLon: number) => {
    const distance = calculateDistance(userLat, userLon, SCHOOL_LAT, SCHOOL_LON);

    return {
        isWithinRange: distance <= ALLOWED_RADIUS,
        distance: distance.toFixed(2),
        allowedRadius: ALLOWED_RADIUS
    };
};

/**
 * Get Time Restrictions
 * Ported from TeacherMarkAttendance.jsx
 */
export const getTimeRestrictions = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const presentCutoff = 11 * 60; // 11:00 AM
    const halfDayCutoff = 14 * 60 + 30; // 2:30 PM

    return {
        canMarkPresent: currentTimeInMinutes < presentCutoff,
        canMarkHalfDay: currentTimeInMinutes < halfDayCutoff,
        canMarkLeave: true,
        presentCutoffTime: '11:00 AM',
        halfDayCutoffTime: '2:30 PM'
    };
};
