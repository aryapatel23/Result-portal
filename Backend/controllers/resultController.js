const Result = require('../models/Result');

const uploadResult = async (req, res) => {
  try {
    const { studentName, grNumber, dateOfBirth, standard, subjects, remarks } = req.body;

    if (!studentName || !grNumber || !dateOfBirth || !standard || !subjects || !subjects.length) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingResult = await Result.findOne({ grNumber });
    if (existingResult) {
      return res.status(400).json({ message: 'Result for this GR Number already exists' });
    }

    const newResult = new Result({ studentName, grNumber, dateOfBirth, standard, subjects, remarks });
    await newResult.save();

    return res.status(201).json({ message: 'Result uploaded successfully' });
  } catch (error) {
    console.error('Error uploading result:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllResultsForAdmin = async (req, res) => {
  try {
    const { standard } = req.query;
    const query = standard ? { standard } : {};

    const results = await Result.find(query);

    res.status(200).json(results); // ✅ Should return an array
  } catch (error) {
    console.error('Error fetching results for admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    res.status(200).json({ message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};


module.exports = {
  uploadResult,
  getAllResultsForAdmin,
  deleteResult,
};