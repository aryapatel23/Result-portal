const Result = require("../models/Result");
const ExcelJS = require("exceljs");

exports.uploadResult = async (req, res) => {
  const { grNumber, studentName, rollNumber, standard, subjects, remarks } = req.body;

  if (!grNumber || !studentName || !rollNumber || !standard || !subjects) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existing = await Result.findOne({ grNumber, standard });
    if (existing) {
      return res.status(409).json({ message: "Result for this GR Number and standard already exists" });
    }

    const result = new Result({
      grNumber,
      studentName,
      rollNumber,
      standard,
      subjects,
      remarks
    });

    await result.save();
    res.status(201).json({ message: "Result uploaded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.exportResults = async (req, res) => {
  try {
    const results = await Result.find();

    if (results.length === 0) {
      return res.status(404).json({ message: "No results found to export" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Results");

    worksheet.columns = [
      { header: "GR Number", key: "grNumber", width: 15 },
      { header: "Student Name", key: "studentName", width: 25 },
      { header: "Roll Number", key: "rollNumber", width: 15 },
      { header: "Standard", key: "standard", width: 10 },
      { header: "Remarks", key: "remarks", width: 30 },
      { header: "Subjects", key: "subjects", width: 50 },
    ];

    results.forEach((result) => {
      const subjectsStr = result.subjects
        .map((subj) => `${subj.name}: ${subj.marks}`)
        .join(", ");

      worksheet.addRow({
        grNumber: result.grNumber,
        studentName: result.studentName,
        rollNumber: result.rollNumber,
        standard: result.standard,
        remarks: result.remarks || "",
        subjects: subjectsStr,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=results.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: "Failed to export results", error: err.message });
  }
};
