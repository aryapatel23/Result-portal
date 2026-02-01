/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // Distance in kilometers
};

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Verify if user location is within allowed radius of school
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @returns {{isValid: boolean, distance: number, message: string}}
 */
const verifyLocation = (userLat, userLon) => {
  const schoolLat = parseFloat(process.env.SCHOOL_LATITUDE);
  const schoolLon = parseFloat(process.env.SCHOOL_LONGITUDE);
  const allowedRadius = parseFloat(process.env.ATTENDANCE_RADIUS_KM);

  if (isNaN(schoolLat) || isNaN(schoolLon) || isNaN(allowedRadius)) {
    return {
      isValid: false,
      distance: 0,
      message: 'School location configuration is missing'
    };
  }

  const distance = calculateDistance(userLat, userLon, schoolLat, schoolLon);
  
  return {
    isValid: distance <= allowedRadius,
    distance: parseFloat(distance.toFixed(2)),
    message: distance <= allowedRadius 
      ? `Location verified (${distance.toFixed(2)} km from school)`
      : `Location too far (${distance.toFixed(2)} km from school, maximum ${allowedRadius} km allowed)`
  };
};

module.exports = {
  calculateDistance,
  verifyLocation
};
