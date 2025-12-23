/**
 * Utility function to format standard display consistently across the application
 * Converts various formats (9, Grade-9, STD-9, Standard 9, etc.) to STD-{number} format
 * Handles special case for Balvatika
 */
const formatStandard = (standard) => {
  if (!standard) return 'N/A';
  
  const stdStr = String(standard).trim();
  
  // Check if it's Balvatika
  if (stdStr.toLowerCase().includes('balvatika') || stdStr.toLowerCase().includes('bal')) {
    return 'Balvatika';
  }
  
  // Extract number from various formats (9, Grade-9, STD-9, Standard 9, etc.)
  const match = stdStr.match(/\d+/);
  if (match) {
    return `STD-${match[0]}`;
  }
  
  // If no number found, return as is
  return stdStr;
};

module.exports = { formatStandard };
