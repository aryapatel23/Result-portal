const Result = require('../models/Result');

const getStudentResult = async (req, res) => {
  const { grNumber, dateOfBirth } = req.query;

  if (!grNumber || !dateOfBirth) {
    return res.status(400).json({ message: 'GR Number and Date of Birth are required' });
  }

  try {
    const result = await Result.findOne({ grNumber, dateOfBirth });

    if (!result) {
      return res.status(404).json({ message: 'No result found' });
    }

    // Calculate total, percentage, grade
    const totalMarks = result.subjects.reduce((acc, s) => acc + s.marks, 0);
    const totalMaxMarks = result.subjects.reduce((acc, s) => acc + s.maxMarks, 0);
    const percentage = ((totalMarks / totalMaxMarks) * 100).toFixed(1);

    return res.status(200).json({
      ...result.toObject(),
      totalMarks,
      totalMaxMarks,
      percentage,
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStudentResult };
