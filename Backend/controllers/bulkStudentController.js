const User = require('../models/User');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { formatStandard } = require('../utils/standardFormatter');

// Bulk upload students via Excel
const bulkUploadStudents = async (req, res) => {
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
      // Delete uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const results = {
      success: [],
      errors: [],
      total: data.length
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Excel row number (1 is header)

      try {
        // Map new column names to expected field names
        const grNumber = row['GR No.'] || row.grNumber;
        const name = row["Student's Name"] || row.name;
        const dateOfBirth = row['DateOfBirth'] || row.dateOfBirth;
        const standard = row['standard'];
        const penNo = row['PEN No.'];
        const aadharNumber = row['Aadhar Number'];
        const childUID = row['Child UID'];
        const mobile = row['Mobile'] || row.parentContact;
        
        // Validate required fields
        if (!grNumber || !name || !dateOfBirth || !standard) {
          results.errors.push({
            row: rowNumber,
            grNumber: grNumber || 'N/A',
            error: 'Missing required fields (GR No., Student\'s Name, DateOfBirth, standard)'
          });
          continue;
        }

        // Check if student already exists
        const existingStudent = await User.findOne({ 
          grNumber: grNumber,
          role: 'student'
        });

        if (existingStudent) {
          results.errors.push({
            row: rowNumber,
            grNumber: grNumber,
            error: 'Student with this GR Number already exists'
          });
          continue;
        }

        // Parse date of birth
        let parsedDateOfBirth;
        if (typeof dateOfBirth === 'number') {
          // Excel serial date number
          parsedDateOfBirth = XLSX.SSF.parse_date_code(dateOfBirth);
          parsedDateOfBirth = new Date(parsedDateOfBirth.y, parsedDateOfBirth.m - 1, parsedDateOfBirth.d);
        } else if (typeof dateOfBirth === 'string') {
          // Try parsing DD/MM/YYYY format
          const parts = dateOfBirth.split('/');
          if (parts.length === 3) {
            parsedDateOfBirth = new Date(parts[2], parts[1] - 1, parts[0]);
          } else {
            parsedDateOfBirth = new Date(dateOfBirth);
          }
        } else {
          parsedDateOfBirth = new Date(dateOfBirth);
        }

        if (isNaN(parsedDateOfBirth.getTime())) {
          results.errors.push({
            row: rowNumber,
            grNumber: grNumber,
            error: 'Invalid date format. Use DD/MM/YYYY'
          });
          continue;
        }

        // Generate default email if not provided
        const studentEmail = row.email ? row.email.trim() : `${grNumber.toString().trim().toLowerCase()}@student.school`;

        // Generate default password (student's GR number)
        const bcrypt = require('bcryptjs');
        const defaultPassword = grNumber.toString().trim();
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Create student
        const student = await User.create({
          grNumber: grNumber.toString().trim(),
          name: name.trim(),
          email: studentEmail,
          password: hashedPassword,
          dateOfBirth: parsedDateOfBirth,
          standard: standard.toString().trim(),
          parentContact: mobile ? mobile.toString().trim() : undefined,
          role: 'student'
        });

        results.success.push({
          row: rowNumber,
          grNumber: student.grNumber,
          name: student.name,
          standard: student.standard
        });

      } catch (error) {
        results.errors.push({
          row: rowNumber,
          grNumber: row.grNumber || 'N/A',
          error: error.message
        });
      }
    }

    // Delete uploaded file after processing
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Bulk upload completed',
      results: {
        total: results.total,
        successful: results.success.length,
        failed: results.errors.length,
        successDetails: results.success,
        errorDetails: results.errors
      }
    });

  } catch (error) {
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Server error during bulk upload', error: error.message });
  }
};

// Download Excel template
const downloadTemplate = (req, res) => {
  try {
    // Create sample data
    const templateData = [
      {
        'No.': 1,
        "Student's Name": 'John Doe',
        'GR No.': 'GR12345',
        'DateOfBirth': '15/08/2010',
        'standard': 'STD-8',
        'PEN No.': 'PEN123456789',
        'Aadhar Number': '123456789012',
        'Child UID': 'UID12345',
        'Mobile': '9876543210'
      },
      {
        'No.': 2,
        "Student's Name": 'Jane Smith',
        'GR No.': 'GR12346',
        'DateOfBirth': '20/05/2010',
        'standard': 'STD-7',
        'PEN No.': 'PEN123456790',
        'Aadhar Number': '123456789013',
        'Child UID': 'UID12346',
        'Mobile': '9876543211'
      },
      {
        'No.': 3,
        "Student's Name": 'Baby Student',
        'GR No.': 'GR12347',
        'DateOfBirth': '10/01/2015',
        'standard': 'Balvatika',
        'PEN No.': 'PEN123456791',
        'Aadhar Number': '123456789014',
        'Child UID': 'UID12347',
        'Mobile': '9876543212'
      }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 6 },  // No.
      { wch: 20 }, // Student's Name
      { wch: 12 }, // GR No.
      { wch: 15 }, // DateOfBirth
      { wch: 10 }, // standard
      { wch: 15 }, // PEN No.
      { wch: 18 }, // Aadhar Number
      { wch: 12 }, // Child UID
      { wch: 15 }  // Mobile
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_upload_template.xlsx');

    res.send(buffer);
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ message: 'Error generating template' });
  }
};

// Single student registration
const registerSingleStudent = async (req, res) => {
  try {
    const { grNumber, name, dateOfBirth, standard, email, parentContact } = req.body;

    // Validate required fields
    if (!grNumber || !name || !dateOfBirth || !standard) {
      return res.status(400).json({ 
        message: 'GR Number, Name, Date of Birth, and Standard are required' 
      });
    }

    // Check if student already exists
    const existingStudent = await User.findOne({ 
      grNumber: grNumber.trim(),
      role: 'student'
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this GR Number already exists' 
      });
    }

    // Parse date
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format' 
      });
    }

    // Generate default email if not provided
    const studentEmail = email ? email.trim() : `${grNumber.trim().toLowerCase()}@student.school`;

    // Generate default password (student's GR number)
    const bcrypt = require('bcryptjs');
    const defaultPassword = grNumber.trim();
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create student
    const student = await User.create({
      grNumber: grNumber.trim(),
      name: name.trim(),
      email: studentEmail,
      password: hashedPassword,
      dateOfBirth: dob,
      standard: standard.trim(),
      parentContact: parentContact ? parentContact.trim() : undefined,
      role: 'student'
    });

    res.status(201).json({
      message: 'Student registered successfully',
      student: {
        id: student._id,
        grNumber: student.grNumber,
        name: student.name,
        standard: student.standard,
        dateOfBirth: student.dateOfBirth,
        email: student.email
      },
      defaultPassword: defaultPassword
    });

  } catch (error) {
    console.error('Student registration error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Server error during student registration', 
      error: error.message 
    });
  }
};

module.exports = {
  bulkUploadStudents,
  downloadTemplate,
  registerSingleStudent
};
