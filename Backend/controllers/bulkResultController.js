const Result = require('../models/Result');
const User = require('../models/User');
const XLSX = require('xlsx');
const { formatStandard } = require('../utils/standardFormatter');
const fs = require('fs');

// Bulk upload results via Excel
const bulkUploadResults = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const results = {
      success: [],
      errors: [],
      total: data.length
    };

    // Expected columns: grNumber, studentName, standard, examType, and subject columns
    // Example: grNumber | studentName | standard | examType | Math | Science | English | ...

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        // Validate required fields
        if (!row.grNumber || !row.studentName || !row.standard) {
          results.errors.push({
            row: rowNumber,
            grNumber: row.grNumber || 'N/A',
            error: 'Missing required fields (grNumber, studentName, standard)'
          });
          continue;
        }

        // Verify student exists
        const student = await User.findOne({
          grNumber: row.grNumber.toString().trim(),
          role: 'student'
        });

        if (!student) {
          results.errors.push({
            row: rowNumber,
            grNumber: row.grNumber,
            error: 'Student not found in system'
          });
          continue;
        }

        // Extract subjects and marks from columns
        const subjects = [];
        const excludedColumns = ['grNumber', 'studentName', 'standard', 'term', 'academicYear', 'dateOfBirth', 'remarks'];
        
        for (const [key, value] of Object.entries(row)) {
          if (!excludedColumns.includes(key) && value !== undefined && value !== null && value !== '') {
            // Key is subject name, value is marks or "marks/maxMarks"
            let marks, maxMarks;
            
            if (typeof value === 'string' && value.includes('/')) {
              // Format: "85/100"
              const parts = value.split('/');
              marks = parseInt(parts[0]);
              maxMarks = parseInt(parts[1]);
            } else {
              // Just marks, assume max is 100
              marks = parseInt(value);
              maxMarks = 100;
            }

            if (!isNaN(marks) && !isNaN(maxMarks)) {
              subjects.push({
                name: key.trim(),
                marks: marks,
                maxMarks: maxMarks
              });
            }
          }
        }

        if (subjects.length === 0) {
          results.errors.push({
            row: rowNumber,
            grNumber: row.grNumber,
            error: 'No valid subjects/marks found'
          });
          continue;
        }

        // Create result
        const result = await Result.create({
          grNumber: row.grNumber.toString().trim(),
          studentName: row.studentName.trim(),
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : student.dob,
          standard: row.standard.toString().trim(),
          term: row.term || 'Term-1',
          academicYear: row.academicYear || '2024-25',
          subjects: subjects,
          remarks: row.remarks || '',
          uploadedBy: req.user.id,
          uploadedByRole: req.user.role || 'teacher'
        });

        results.success.push({
          row: rowNumber,
          grNumber: result.grNumber,
          studentName: result.studentName,
          standard: result.standard,
          term: result.term,
          subjects: subjects.length
        });

      } catch (error) {
        results.errors.push({
          row: rowNumber,
          grNumber: row.grNumber || 'N/A',
          error: error.message
        });
      }
    }

    // Delete uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Bulk upload completed',
      total: results.total,
      success: results.success,
      errors: results.errors
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Bulk result upload error:', error);
    res.status(500).json({ message: 'Server error during bulk upload', error: error.message });
  }
};

// Download Excel template for bulk result upload
const downloadResultTemplate = (req, res) => {
  try {
    const templateData = [
      {
        grNumber: '12345',
        studentName: 'John Doe',
        dateOfBirth: '2010-01-15',
        standard: 'STD-8',
        term: 'Term-1',
        academicYear: '2024-25',
        Math: '85/100',
        Science: '78/100',
        English: '92/100',
        'Social Science': '88/100',
        Hindi: '75/100',
        remarks: 'Good performance'
      },
      {
        grNumber: '12346',
        studentName: 'Jane Smith',
        dateOfBirth: '2010-03-20',
        standard: 'STD-7',
        term: 'Term-1',
        academicYear: '2024-25',
        Math: '92/100',
        Science: '88/100',
        English: '95/100',
        'Social Science': '90/100',
        Hindi: '85/100',
        remarks: 'Excellent work'
      },
      {
        grNumber: '12347',
        studentName: 'Baby Student',
        dateOfBirth: '2015-01-10',
        standard: 'Balvatika',
        term: 'Term-1',
        academicYear: '2024-25',
        Math: '75/100',
        Science: '80/100',
        English: '78/100',
        'Social Science': '82/100',
        Hindi: '70/100',
        remarks: 'Doing well'
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // grNumber
      { wch: 20 }, // studentName
      { wch: 15 }, // dateOfBirth
      { wch: 10 }, // standard
      { wch: 12 }, // term
      { wch: 15 }, // academicYear
      { wch: 12 }, // Math
      { wch: 12 }, // Science
      { wch: 12 }, // English
      { wch: 15 }, // Social Science
      { wch: 12 }, // Hindi
      { wch: 25 }  // remarks
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Results');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=result_upload_template.xlsx');

    res.send(buffer);
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ message: 'Error generating template' });
  }
};

module.exports = {
  bulkUploadResults,
  downloadResultTemplate
};
