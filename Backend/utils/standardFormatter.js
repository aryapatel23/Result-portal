/**
 * Utility function to format standard display consistently across the application
 * Converts various formats (9, Grade-9, STD-9, Standard 9, etc.) to Std-{number} format
 * Handles special case for Balvatika
 *
 * School has fixed standards: Balvatika and STD-1 through STD-8.
 */

/**
 * The definitive list of valid standards for this school.
 * Used by backend validation and shared with frontend via API if needed.
 */
const SCHOOL_STANDARDS = ['Balvatika', 'STD-1', 'STD-2', 'STD-3', 'STD-4', 'STD-5', 'STD-6', 'STD-7', 'STD-8'];
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeStandard = (standard) => {
  if (standard === null || standard === undefined || standard === '') return standard;

  const stdStr = String(standard).trim();
  const lower = stdStr.toLowerCase();

  if (lower.includes('balvatika') || lower === 'bal') {
    return 'Balvatika';
  }

  if (lower === 'graduated') {
    return 'Graduated';
  }

  const match = stdStr.match(/\d+/);
  if (match) {
    return `STD-${match[0]}`;
  }

  return stdStr;
};

const formatStandard = (standard) => {
  const normalized = normalizeStandard(standard);
  return normalized || 'N/A';
};

const buildStandardQuery = (standard) => {
  const normalized = normalizeStandard(standard);
  if (!normalized) return {};

  const raw = String(standard).trim();
  const numeric = String(normalized).match(/\d+/)?.[0];
  const regexParts = [
    `^${escapeRegex(normalized)}$`,
    `^${escapeRegex(raw)}$`
  ];

  if (numeric) {
    regexParts.push(`grade\\s*${numeric}`);
    regexParts.push(`std\\s*${numeric}`);
    regexParts.push(`standard\\s*${numeric}`);
    regexParts.push(`^${escapeRegex(numeric)}$`);
  }

  return {
    $or: [
      { standard: normalized },
      { standard: { $regex: new RegExp(regexParts.join('|'), 'i') } }
    ]
  };
};

module.exports = { formatStandard, normalizeStandard, buildStandardQuery, SCHOOL_STANDARDS };

