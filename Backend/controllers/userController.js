const Result = require("../models/Result");
const User = require("../models/User");

exports.getResult = async (req, res) => {
  const { grNumber, standard } = req.query;

  if (!grNumber || !standard) {
    return res.status(400).json({ message: "grNumber and standard are required" });
  }

  try {
    const result = await Result.findOne({ grNumber, standard });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving result", error });
  }
};

exports.getStudentByGR = async (req, res) => {
  const { grNumber } = req.params;

  if (!grNumber) {
    return res.status(400).json({ message: "GR Number is required" });
  }

  try {
    const student = await User.findOne({ grNumber, role: 'student' })
      .select('name grNumber dateOfBirth standard parentContact');

    if (!student) {
      return res.status(404).json({ message: "Student not found with this GR Number" });
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving student", error });
  }
};