// const Result = require('../models/Result');

// const uploadResult = async (req, res) => {
//   try {
//     const { studentName, grNumber, dateOfBirth, standard, subjects, remarks } = req.body;

//     if (!studentName || !grNumber || !dateOfBirth || !standard || !subjects || !subjects.length) {
//       return res.status(400).json({ message: 'Please fill all required fields' });
//     }

//     const existingResult = await Result.findOne({ grNumber });
//     if (existingResult) {
//       return res.status(400).json({ message: 'Result for this GR Number already exists' });
//     }

//     const newResult = new Result({ studentName, grNumber, dateOfBirth, standard, subjects, remarks });
//     await newResult.save();

//     return res.status(201).json({ message: 'Result uploaded successfully' });
//   } catch (error) {
//     console.error('Error uploading result:', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// const getAllResultsForAdmin = async (req, res) => {
//   try {
//     const { standard } = req.query;
//     const query = standard ? { standard } : {};

//     const results = await Result.find(query);

//     res.status(200).json(results); // ✅ Should return an array
//   } catch (error) {
//     console.error('Error fetching results for admin:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// const deleteResult = async (req, res) => {
//   try {
//     const result = await Result.findByIdAndDelete(req.params.id);
//     if (!result) {
//       return res.status(404).json({ message: 'Result not found' });
//     }
//     res.status(200).json({ message: 'Result deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server Error', error });
//   }
// };


// module.exports = {
//   uploadResult,
//   getAllResultsForAdmin,
//   deleteResult,
// };





const Result = require('../models/Result');

const uploadResult = async (req, res) => {
  try {
    const { studentName, grNumber, dateOfBirth, standard, subjects, remarks, academicYear, term } = req.body;

    if (!studentName || !grNumber || !dateOfBirth || !standard || !subjects || !subjects.length) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const existingResult = await Result.findOne({ grNumber });
    if (existingResult) {
      return res.status(400).json({ message: 'Result for this GR Number already exists' });
    }

    const newResult = new Result({ 
      studentName, 
      grNumber, 
      dateOfBirth, 
      standard, 
      subjects, 
      remarks,
      uploadedBy: req.user.id,
      uploadedByRole: req.user.role || 'teacher',
      academicYear: academicYear || '2024-25',
      term: term || 'Term-1'
    });
    
    await newResult.save();

    return res.status(201).json({ message: 'Result uploaded successfully' });
  } catch (error) {
    console.error('Error uploading result:', error);
    console.error('Error details:', error.message);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllResultsForAdmin = async (req, res) => {
  try {
    const { standard } = req.query;
    const query = standard ? { standard } : {};

    const results = await Result.find(query).populate('uploadedBy', 'name employeeId email');

    res.status(200).json(results); // ✅ returns array
  } catch (error) {
    console.error('Error fetching results for admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// const updateResult = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     // Find and update by ID
//     const updatedResult = await Result.findByIdAndUpdate(id, updates, {
//       new: true,          // return updated doc
//       runValidators: true // validate schema
//     });

//     if (!updatedResult) {
//       return res.status(404).json({ message: 'Result not found' });
//     }

//     res.status(200).json({
//       message: 'Result updated successfully',
//       result: updatedResult
//     });
//   } catch (error) {
//     console.error('Error updating result:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

const updateResult = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedResult = await Result.findByIdAndUpdate(
      id,
      { $set: req.body },  // dynamically update only provided fields
      { new: true, runValidators: true }
    );

    if (!updatedResult) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({
      message: "Result updated successfully",
      updatedResult
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  uploadResult,
  getAllResultsForAdmin,
  deleteResult,
  updateResult ,  
  getResultById
};
