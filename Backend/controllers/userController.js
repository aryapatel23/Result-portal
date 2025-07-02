const Result = require("../models/Result");

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