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
const { normalizeStandard, buildStandardQuery } = require('../utils/standardFormatter');

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

    const existingResult = await Result.findOne({
      grNumber,
      term: term || 'Term-1',
      academicYear: academicYear || '2024-25'
    });
    if (existingResult) {
      return res.status(400).json({ message: 'Result already exists for this student in selected term and academic year' });
    }

    const newResult = new Result({ 
      studentName, 
      grNumber, 
      dateOfBirth, 
      standard: normalizeStandard(standard), 
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
    const query = standard ? buildStandardQuery(standard) : {};

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

    const requesterId = String(req.user?.id || req.user?._id || '');

    // Teacher can only access their own uploaded results
    if (req.user?.role === 'teacher' && result.uploadedBy?.toString() !== requesterId) {
      return res.status(403).json({ message: 'You can only access results you uploaded' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    const requesterId = String(req.user?.id || req.user?._id || '');

    // Teacher can only delete their own uploaded results
    if (req.user?.role === 'teacher' && result.uploadedBy?.toString() !== requesterId) {
      return res.status(403).json({ message: 'You can only delete results you uploaded' });
    }

    await Result.findByIdAndDelete(req.params.id);
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
    const result = await Result.findById(id);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const requesterId = String(req.user?.id || req.user?._id || '');

    // Teacher can only update their own uploaded results
    if (req.user?.role === 'teacher' && result.uploadedBy?.toString() !== requesterId) {
      return res.status(403).json({ message: 'You can only edit results you uploaded' });
    }

    const updates = { ...req.body };

    // Normalize subjects payload from frontend before validation
    if (Array.isArray(updates.subjects)) {
      updates.subjects = updates.subjects.map((s) => ({
        name: s.name,
        marks: Number(s.marks),
        maxMarks: Number(s.maxMarks),
      }));
    }

    const updatedResult = await Result.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

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
