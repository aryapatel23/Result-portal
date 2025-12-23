const Result = require("../models/Result");
const User = require("../models/User");
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

// Get results upload activity by teachers
exports.getResultsActivity = async (req, res) => {
  try {
    // Aggregate results by teacher
    const activity = await Result.aggregate([
      {
        $match: {
          uploadedBy: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$uploadedBy",
          totalUploads: { $sum: 1 },
          lastUploadDate: { $max: "$createdAt" },
          standards: { $addToSet: "$standard" },
          terms: { $addToSet: "$term" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "teacher"
        }
      },
      {
        $unwind: "$teacher"
      },
      {
        $project: {
          teacherId: "$_id",
          teacherName: "$teacher.name",
          employeeId: "$teacher.employeeId",
          email: "$teacher.email",
          totalUploads: 1,
          lastUploadDate: 1,
          standardsCount: { $size: "$standards" },
          termsCount: { $size: "$terms" }
        }
      },
      {
        $sort: { totalUploads: -1 }
      }
    ]);

    res.json({ activity });
  } catch (error) {
    console.error('Error fetching results activity:', error);
    res.status(500).json({ message: 'Failed to fetch results activity', error: error.message });
  }
};