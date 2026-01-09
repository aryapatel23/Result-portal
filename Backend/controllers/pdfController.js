const PDFDocument = require('pdfkit');
const Result = require('../models/Result');
const User = require('../models/User');
const { formatStandard } = require('../utils/standardFormatter');
const axios = require('axios');

// Helper function to fetch image as buffer
const fetchImageAsBuffer = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.log(`Failed to fetch image from ${url}:`, error.message);
    return null;
  }
};

// Helper function to draw a bordered table cell
const drawTableCell = (doc, x, y, width, height, text, options = {}) => {
  const {
    fontSize = 10,
    font = 'Helvetica',
    align = 'left',
    bgColor = null,
    borderColor = '#000000',
    textColor = '#000000',
    bold = false,
    lineWidth = 0.5
  } = options;

  // Ensure text is a string
  const textStr = text != null ? String(text) : '';

  // Draw background
  if (bgColor) {
    doc.rect(x, y, width, height).fillAndStroke(bgColor, borderColor);
  } else {
    doc.rect(x, y, width, height).stroke(borderColor);
  }

  // Draw text
  doc.fillColor(textColor)
    .fontSize(fontSize)
    .font(bold ? 'Helvetica-Bold' : font);

  const textY = y + (height - fontSize) / 2 + 2;
  const padding = 5;

  if (align === 'center') {
    doc.text(textStr, x + padding, textY, { width: width - padding * 2, align: 'center' });
  } else if (align === 'right') {
    doc.text(textStr, x + padding, textY, { width: width - padding * 2, align: 'right' });
  } else {
    doc.text(textStr, x + padding, textY, { width: width - padding * 2, align: 'left' });
  }
};

// @desc    Generate PDF report card for a student
// @route   GET /api/pdf/report-card/:grNumber
// @access  Teacher/Admin/Student
exports.generateReportCard = async (req, res) => {
  try {
    const { grNumber } = req.params;
    const { examType, standard } = req.query;

    // Find student
    const student = await User.findOne({ grNumber, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Build query for results
    const query = { grNumber };
    if (examType) query.examType = examType;
    if (standard) {
      query.standard = {
        $regex: new RegExp(`^${standard}$|grade\\s*${standard}|std\\s*${standard}|standard\\s*${standard}`, 'i')
      };
    }

    // Fetch results
    const results = await Result.find(query).sort({ uploadedAt: -1 });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No results found for this student' });
    }

    // Fetch logos as buffers
    const leftLogoBuffer = await fetchImageAsBuffer('https://res.cloudinary.com/dzsvjyg2c/image/upload/v1748249134/gyzoxsk22n0z1kkkh3di.png');
    const rightLogoBuffer = await fetchImageAsBuffer('https://res.cloudinary.com/dzsvjyg2c/image/upload/v1748249134/gyzoxsk22n0z1kkkh3di.png');

    // Create PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ReportCard_${grNumber}_${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Pipe PDF to response
    doc.pipe(res);

    // Process each result
    results.forEach((result, resultIndex) => {
      if (resultIndex > 0) {
        doc.addPage();
      }

      // Draw outer border
      doc.lineWidth(1.5).rect(20, 20, 555, 802).stroke('#000000');

      // ============ HEADER SECTION ============
      let currentY = 30;

      // Left Logo
      if (leftLogoBuffer) {
        try {
          doc.image(leftLogoBuffer, 35, currentY, { width: 70, height: 70 });
        } catch (error) {
          console.log('Could not load left logo:', error.message);
        }
      }

      // Right Logo
      if (rightLogoBuffer) {
        try {
          doc.image(rightLogoBuffer, 490, currentY, { width: 70, height: 70 });
        } catch (error) {
          console.log('Could not load right logo:', error.message);
        }
      }

      // Header Text Section - Centered between logos
      const headerTextX = 115;
      const headerTextWidth = 365;

      // Society Name (Small, top)
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#000000')
        .text('Devaraj Urs Education Society (R)', headerTextX, currentY + 5, { width: headerTextWidth, align: 'center' });

      // School Name (Large, Bold)
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('KAMLI ANUPAM PRIMARY SCHOOL', headerTextX, currentY + 20, { width: headerTextWidth, align: 'center' });

      // College Code
      doc.fontSize(8)
        .font('Helvetica')
        .text('(School Code: KAP 001)', headerTextX, currentY + 38, { width: headerTextWidth, align: 'center' });

      // Address
      doc.fontSize(8)
        .font('Helvetica')
        .text('Vidyadhaana Soudha, NH-4, Near Challakere Tollgate, Chitradurga - 577 501, Karnataka.',
          headerTextX, currentY + 50, { width: headerTextWidth, align: 'center' });

      currentY += 85;

      // Result Title
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .text(`RESULT OF ${result.term || 'Term-1'} ${result.academicYear || '2024-25'}`,
          30, currentY, { width: 535, align: 'center' });

      currentY += 20;

      // ============ STUDENT INFORMATION TABLE ============
      const infoTableX = 40;
      const infoTableWidth = 515;
      const colWidth = infoTableWidth / 2;
      const rowHeight = 25;

      // Draw outer border for student info section
      const studentInfoStartY = currentY;

      // Row 1: Student Name | Class
      drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
        `Student's Name : ${student.name}`, { fontSize: 10, font: 'Helvetica' });
      drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
        `Class : ${formatStandard(result.standard)}`, { fontSize: 10, font: 'Helvetica' });
      currentY += rowHeight;

      // Row 2: GR Number | Enrollment No
      drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
        `GR Number : ${student.grNumber}`, { fontSize: 10, font: 'Helvetica' });
      drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
        `Enrollment No : ${student.grNumber}`, { fontSize: 10, font: 'Helvetica' });
      currentY += rowHeight;

      // Row 3: Email | DOB
      drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
        `Email : ${student.email || 'N/A'}`, { fontSize: 10, font: 'Helvetica' });
      drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
        `DOB : ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}`, { fontSize: 10, font: 'Helvetica' });
      currentY += rowHeight;

      // Row 4: Stream/Section | Combination (can be customized)
      drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
        `Stream : General`, { fontSize: 10, font: 'Helvetica' });
      drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
        `Section : A`, { fontSize: 10, font: 'Helvetica' });
      currentY += rowHeight;

      // Row 5: Academic Year | Language
      drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
        `Academic Year : ${result.academicYear || '2024-25'}`, { fontSize: 10, font: 'Helvetica' });
      drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
        `Language : English`, { fontSize: 10, font: 'Helvetica' });
      currentY += rowHeight;

      // Outer border around student info section
      doc.rect(infoTableX, studentInfoStartY, infoTableWidth, rowHeight * 5)
        .lineWidth(1.5)
        .stroke('#000000');

      currentY += 10;

      // Horizontal separator line after student info
      doc.moveTo(40, currentY).lineTo(555, currentY)
        .lineWidth(1)
        .stroke('#000000');

      currentY += 20; // More spacing before marks table

      // ============ MARKS TABLE ============
      const marksTableX = 40;
      const marksTableWidth = 515;
      const snWidth = 40;
      const subjectWidth = 310;
      const maxMarksWidth = 82.5;
      const obtainedMarksWidth = 82.5;
      const headerHeight = 30;
      const dataRowHeight = 25;

      // Table Header (Gray background)
      drawTableCell(doc, marksTableX, currentY, snWidth, headerHeight,
        'SN', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
      drawTableCell(doc, marksTableX + snWidth, currentY, subjectWidth, headerHeight,
        'SUBJECTS', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
      drawTableCell(doc, marksTableX + snWidth + subjectWidth, currentY, maxMarksWidth, headerHeight,
        'MAXIMUM MARKS', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
      drawTableCell(doc, marksTableX + snWidth + subjectWidth + maxMarksWidth, currentY, obtainedMarksWidth, headerHeight,
        'OBTAINED MARKS', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
      currentY += headerHeight;

      // Subject Rows
      let totalObtained = 0;
      let totalMax = 0;

      result.subjects.forEach((subject, index) => {
        // Alternate row colors (light pink/white)
        const bgColor = index % 2 === 0 ? '#FFE5E5' : '#FFFFFF';

        // Safety checks for undefined marks - use correct field names: marks and maxMarks
        const totalMarks = subject.maxMarks || 0;
        const obtainedMarks = subject.marks || 0;

        drawTableCell(doc, marksTableX, currentY, snWidth, dataRowHeight,
          (index + 1).toString(), { fontSize: 10, align: 'center', bgColor: bgColor });
        drawTableCell(doc, marksTableX + snWidth, currentY, subjectWidth, dataRowHeight,
          subject.name || 'N/A', { fontSize: 10, bgColor: bgColor });
        drawTableCell(doc, marksTableX + snWidth + subjectWidth, currentY, maxMarksWidth, dataRowHeight,
          totalMarks.toString(), { fontSize: 10, align: 'center', bgColor: bgColor });
        drawTableCell(doc, marksTableX + snWidth + subjectWidth + maxMarksWidth, currentY, obtainedMarksWidth, dataRowHeight,
          obtainedMarks.toString(), { fontSize: 10, align: 'center', bgColor: bgColor });

        totalObtained += obtainedMarks;
        totalMax += totalMarks;
        currentY += dataRowHeight;
      });

      // Total Row (Light blue background)
      drawTableCell(doc, marksTableX, currentY, snWidth + subjectWidth, dataRowHeight,
        `Marks Obtained : ${totalObtained} Out Of ${totalMax}`, { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#ADD8E6', bold: true });
      drawTableCell(doc, marksTableX + snWidth + subjectWidth, currentY, maxMarksWidth + obtainedMarksWidth, dataRowHeight,
        '', { bgColor: '#ADD8E6' });
      currentY += dataRowHeight;

      // Horizontal separator line
      doc.moveTo(marksTableX, currentY + 10).lineTo(marksTableX + marksTableWidth, currentY + 10)
        .lineWidth(1)
        .stroke('#000000');

      currentY += 30; // More spacing before percentage box

      // ============ PERCENTAGE AND RESULT BOX ============
      const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
      const resultStatus = percentage >= 35 ? 'PASS' : 'FAIL';
      const resultBoxHeight = 40;

      // Draw the full box with light yellow background
      doc.rect(marksTableX, currentY, marksTableWidth, resultBoxHeight)
        .fillAndStroke('#FFFACD', '#000000');

      // Left side - Percentage
      doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(`Percentage : ${percentage}`, marksTableX + 10, currentY + 13, { width: 150, align: 'left' });

      // Center - Watermark (light gray, smaller font)
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#D3D3D3')
        .text('Powered By Result Hosting™', marksTableX + 150, currentY + 15, { width: 215, align: 'center' });

      // Right side - Result
      doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(`Result : ${resultStatus}`, marksTableX + 365, currentY + 13, { width: 150, align: 'right' });

      currentY += resultBoxHeight + 10;

      // Horizontal separator line after percentage box
      doc.moveTo(40, currentY).lineTo(555, currentY)
        .lineWidth(1)
        .stroke('#000000');

      currentY += 20;

      // ============ VISIT SECTION ============
      const visitBoxHeight = 50;

      // Draw visit section with border
      doc.rect(marksTableX, currentY, marksTableWidth, visitBoxHeight)
        .lineWidth(1.5)
        .stroke('#000000');

      doc.fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Visit:', marksTableX + 10, currentY + 15, { width: 100, align: 'left' });

      doc.fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#FF0000')
        .text('www.resulthosting.net', marksTableX + 120, currentY + 15, { width: 385, align: 'left' });

      currentY += visitBoxHeight + 10;

      // Horizontal separator line after visit section
      doc.moveTo(40, currentY).lineTo(555, currentY)
        .lineWidth(1)
        .stroke('#000000');

      currentY += 20;

      // Remarks if present
      if (result.remarks) {
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#000000')
          .text('Remarks: ', 40, currentY, { continued: true })
          .font('Helvetica')
          .text(result.remarks, { width: 515 });
        currentY += 30;
      }

      // ============ SIGNATURE SECTION ============
      currentY = 670; // Adjusted position to fit all sections

      // Draw border around signature section
      const signatureBoxHeight = 60;
      doc.rect(40, currentY, 515, signatureBoxHeight)
        .lineWidth(1.5)
        .stroke('#000000');

      // Signature boxes
      const signatureY = currentY + 40;
      const signatureWidth = 170;

      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#000000')
        .text('Class Teacher\'s Sign.', 40, signatureY, { width: signatureWidth, align: 'center' })
        .text('Office Seal', 210, signatureY, { width: signatureWidth, align: 'center' })
        .text('Principal\'s Sign.', 380, signatureY, { width: signatureWidth, align: 'center' });

      // Lines for signatures
      doc.moveTo(40, signatureY - 5).lineTo(200, signatureY - 5).stroke();
      doc.moveTo(210, signatureY - 5).lineTo(370, signatureY - 5).stroke();
      doc.moveTo(380, signatureY - 5).lineTo(540, signatureY - 5).stroke();

      currentY += signatureBoxHeight + 10;

      // Horizontal separator line after signature section
      doc.moveTo(40, currentY).lineTo(555, currentY)
        .lineWidth(1)
        .stroke('#000000');

      currentY += 10;

      // ============ DISCLAIMER ============
      doc.fontSize(7)
        .font('Helvetica-Bold')
        .fillColor('#FF0000')
        .text('Disclaimer : ', 40, currentY, { continued: true })
        .font('Helvetica')
        .fillColor('#000000')
        .text('Neither webmaster nor Result Hosting is responsible for any inadvertent error that may creep in the results being published on NET.', { width: 515 });

      doc.fontSize(7)
        .text('The results published on net are immediate information for Students. This cannot be treated as original mark sheet Until Signed Or Stamped By School Office.',
          40, currentY + 10, { width: 515 });
      doc.moveTo(210, signatureY - 5).lineTo(370, signatureY - 5).stroke();
      doc.moveTo(380, signatureY - 5).lineTo(540, signatureY - 5).stroke();

      // ============ FOOTER/DISCLAIMER ============
      currentY = signatureY + 25;

      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#FF0000')
        .text('Disclaimer : ', 40, currentY, { continued: true, underline: true })
        .fillColor('#000000')
        .font('Helvetica')
        .text('Neither webmaster nor Result Hosting is responsible for any inadvertent error that may crept in the results being published on NET.', { width: 515 });

      currentY += 15;
      doc.fontSize(7)
        .text('The results published on net are immediate information for Students. This cannot be treated as original mark sheet Until Signed Or Stamped By School Office.', 40, currentY, { width: 515 });

      currentY += 20;
      doc.fontSize(8)
        .fillColor('#000000')
        .text(`Generated on: ${new Date().toLocaleString()}`, 40, currentY, { width: 515, align: 'center' });
    });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
    }
  }
};

// @desc    Generate PDF for latest result
// @route   GET /api/pdf/latest-result/:grNumber
// @access  Public/Student
exports.generateLatestResultPDF = async (req, res) => {
  try {
    console.log('Starting PDF generation for GR:', req.params.grNumber);
    const { grNumber } = req.params;

    // Find student
    const student = await User.findOne({ grNumber, role: 'student' });
    console.log('Student found:', student ? 'Yes' : 'No');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch latest result (sort by createdAt descending)
    const result = await Result.findOne({ grNumber }).sort({ createdAt: -1 });
    console.log('Result found:', result ? 'Yes' : 'No');

    if (!result) {
      return res.status(404).json({ message: 'No results found' });
    }

    // Fetch logos as buffers
    const leftLogoBuffer = await fetchImageAsBuffer('https://res.cloudinary.com/dzsvjyg2c/image/upload/v1766313043/50_srwqa0.png');
    const rightLogoBuffer = await fetchImageAsBuffer('https://res.cloudinary.com/dzsvjyg2c/image/upload/v1748249134/gyzoxsk22n0z1kkkh3di.png');

    console.log('Creating PDF document...');
    // Create PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=LatestResult_${grNumber}_${Date.now()}.pdf`);

    doc.pipe(res);

    console.log('Drawing PDF content...');

    // Draw outer border
    doc.lineWidth(1.5).rect(20, 20, 555, 802).stroke('#000000');

    // ============ HEADER SECTION ============
    let currentY = 30;

    // Left Logo
    if (leftLogoBuffer) {
      try {
        doc.image(leftLogoBuffer, 35, currentY, { width: 70, height: 70 });
      } catch (error) {
        console.log('Could not load left logo:', error.message);
      }
    }

    // Right Logo
    if (rightLogoBuffer) {
      try {
        doc.image(rightLogoBuffer, 490, currentY, { width: 70, height: 70 });
      } catch (error) {
        console.log('Could not load right logo:', error.message);
      }
    }

    // Header Text Section - Centered between logos
    const headerTextX = 115;
    const headerTextWidth = 365;

    // Society Name (Small, top)
    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Devaraj Urs Education Society (R)', headerTextX, currentY + 5, { width: headerTextWidth, align: 'center' });

    // School Name (Large, Bold)
    doc.fontSize(16)
      .font('Helvetica-Bold')
      .text('KAMLI ANUPAM PRIMARY SCHOOL', headerTextX, currentY + 20, { width: headerTextWidth, align: 'center' });

    // College Code
    doc.fontSize(8)
      .font('Helvetica')
      .text('(School Code: KAP 001)', headerTextX, currentY + 38, { width: headerTextWidth, align: 'center' });

    // Address
    doc.fontSize(8)
      .font('Helvetica')
      .text('Taluka :- Unjha',
        headerTextX, currentY + 50, { width: headerTextWidth, align: 'center' });

    currentY += 85;

    // Result Title
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text(`RESULT OF ${result.term || 'Term-1'} ${result.academicYear || '2024-25'}`,
        30, currentY, { width: 535, align: 'center' });

    currentY += 20;

    // ============ STUDENT INFORMATION TABLE ============
    const infoTableX = 40;
    const infoTableWidth = 515;
    const colWidth = infoTableWidth / 2;
    const rowHeight = 25;

    // Draw outer border for student info section
    const studentInfoStartY = currentY;

    // Row 1: Student Name | Class
    drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
      `Student's Name : ${student.name}`, { fontSize: 10, font: 'Helvetica' });
    drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
      `Class : ${formatStandard(result.standard)}`, { fontSize: 10, font: 'Helvetica' });
    currentY += rowHeight;

    // Row 2: GR Number | DOB
    drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
      `GR Number : ${student.grNumber}`, { fontSize: 10, font: 'Helvetica' });
    drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
      `DOB : ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}`, { fontSize: 10, font: 'Helvetica' });
    currentY += rowHeight;

    // Row 3: Academic Year | Section
    drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
      `Academic Year : ${result.academicYear || '2024-25'}`, { fontSize: 10, font: 'Helvetica' });
    drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
      `Section : A`, { fontSize: 10, font: 'Helvetica' });
    currentY += rowHeight;



    // Outer border around student info section
    doc.rect(infoTableX, studentInfoStartY, infoTableWidth, rowHeight * 3)
      .lineWidth(1.5)
      .stroke('#000000');

    currentY += 10;

    // Horizontal separator line after student info
    doc.moveTo(40, currentY).lineTo(555, currentY)
      .lineWidth(1)
      .stroke('#000000');

    currentY += 20; // More spacing before marks table



    // ============ MARKS TABLE ============
    const marksTableX = 40;
    const marksTableWidth = 515;
    const snWidth = 40;
    const subjectWidth = 250;
    const maxMarksWidth = 112.5;
    const obtainedMarksWidth = 112.5;
    const headerHeight = 30;
    const dataRowHeight = 25;

    // Table Header (Gray background)
    drawTableCell(doc, marksTableX, currentY, snWidth, headerHeight,
      'SN', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
    drawTableCell(doc, marksTableX + snWidth, currentY, subjectWidth, headerHeight,
      'SUBJECTS', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
    drawTableCell(doc, marksTableX + snWidth + subjectWidth, currentY, maxMarksWidth, headerHeight,
      'MAXIMUM MARKS', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
    drawTableCell(doc, marksTableX + snWidth + subjectWidth + maxMarksWidth, currentY, obtainedMarksWidth, headerHeight,
      'OBTAINED MARKS', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
    currentY += headerHeight;

    // Subject Rows
    let totalObtained = 0;
    let totalMax = 0;

    result.subjects.forEach((subject, index) => {
      // Alternate row colors (light pink/white)
      const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FFFFFF';

      // Safety checks for undefined marks - use correct field names: marks and maxMarks
      const totalMarks = subject.maxMarks || 0;
      const obtainedMarks = subject.marks || 0;

      drawTableCell(doc, marksTableX, currentY, snWidth, dataRowHeight,
        (index + 1).toString(), { fontSize: 10, align: 'center', bgColor: bgColor });
      drawTableCell(doc, marksTableX + snWidth, currentY, subjectWidth, dataRowHeight,
        subject.name || 'N/A', { fontSize: 10, bgColor: bgColor });
      drawTableCell(doc, marksTableX + snWidth + subjectWidth, currentY, maxMarksWidth, dataRowHeight,
        totalMarks.toString(), { fontSize: 10, align: 'center', bgColor: bgColor });
      drawTableCell(doc, marksTableX + snWidth + subjectWidth + maxMarksWidth, currentY, obtainedMarksWidth, dataRowHeight,
        obtainedMarks.toString(), { fontSize: 10, align: 'center', bgColor: bgColor });

      totalObtained += obtainedMarks;
      totalMax += totalMarks;
      currentY += dataRowHeight;
    });

    // Total Row (Light blue background)
    drawTableCell(doc, marksTableX, currentY, snWidth + subjectWidth + maxMarksWidth + obtainedMarksWidth, dataRowHeight,
      `Marks Obtained : ${totalObtained} Out Of ${totalMax}`, { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#ADD8E6', bold: true });
    // drawTableCell(doc, marksTableX + snWidth + subjectWidth, currentY, maxMarksWidth + obtainedMarksWidth, dataRowHeight, 
    //   '', { bgColor: '#ADD8E6' });
    currentY += dataRowHeight;

    // Horizontal separator line
    doc.moveTo(marksTableX, currentY + 10).lineTo(marksTableX + marksTableWidth, currentY + 10)
      .lineWidth(1)
      .stroke('#000000');

    currentY += 30; // More spacing before percentage box

    // ============ PERCENTAGE AND RESULT BOX ============
    const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
    const resultStatus = percentage >= 35 ? 'PASS' : 'FAIL';
    const resultBoxHeight = 40;

    // Draw the full box with light yellow background
    doc.rect(marksTableX, currentY, marksTableWidth, resultBoxHeight)
      .fillAndStroke('#FFFACD', '#000000');

    // Left side - Percentage
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(`Percentage : ${percentage}`, marksTableX + 10, currentY + 13, { width: 150, align: 'left' });


    // Right side - Result
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(`Result : ${resultStatus}`, marksTableX + 365, currentY + 13, { width: 150, align: 'right' });

    currentY += resultBoxHeight + 10;

    // Horizontal separator line after percentage box
    doc.moveTo(40, currentY).lineTo(555, currentY)
      .lineWidth(1)
      .stroke('#000000');

    currentY += 20;

    // Remarks if present
    if (result.remarks) {
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Remarks: ', 40, currentY, { continued: true })
        .font('Helvetica')
        .text(result.remarks, { width: 515 });
      currentY += 30;
    }

    // ============ SIGNATURE SECTION ============
    currentY = 670; // Adjusted position to fit all sections

    // Draw border around signature section
    const signatureBoxHeight = 60;

    // Signature boxes
    const signatureY = currentY + 40;
    const signatureWidth = 170;

    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Class Teacher\'s Sign.', 40, signatureY, { width: signatureWidth, align: 'center' })
      .text('Office Seal', 210, signatureY, { width: signatureWidth, align: 'center' })
      .text('Principal\'s Sign.', 380, signatureY, { width: signatureWidth, align: 'center' });

    // Lines for signatures
    doc.moveTo(40, signatureY - 5).lineTo(200, signatureY - 5).stroke();
    doc.moveTo(210, signatureY - 5).lineTo(370, signatureY - 5).stroke();
    doc.moveTo(380, signatureY - 5).lineTo(540, signatureY - 5).stroke();

    currentY += signatureBoxHeight + 10;

    // Horizontal separator line after signature section
    doc.moveTo(40, currentY).lineTo(555, currentY)
      .lineWidth(1)
      .stroke('#000000');

    currentY += 10;

    // ============ DISCLAIMER ============
    doc.fontSize(7)
      .font('Helvetica-Bold')
      .fillColor('#FF0000')
      .text('Disclaimer : ', 40, currentY, { continued: true })
      .font('Helvetica')
      .fillColor('#000000')
      .text('Neither webmaster nor Result Hosting is responsible for any inadvertent error that may creep in the results being published on NET.', { width: 515 });

    doc.fontSize(7)
      .text('The results published on net are immediate information for Students. This cannot be treated as original mark sheet Until Signed Or Stamped By School Office.',
        40, currentY + 10, { width: 515 });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
    }
  }
};

// @desc    Generate PDF for specific result by ID
// @route   GET /api/pdf/result/:resultId
// @access  Public/Student
exports.generateResultPDFById = async (req, res) => {
  try {
    const { resultId } = req.params;

    // Fetch specific result by ID
    const result = await Result.findById(resultId);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    // Find student
    const student = await User.findOne({ grNumber: result.grNumber, role: 'student' });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch logos as buffers
    const leftLogoBuffer = await fetchImageAsBuffer('https://res.cloudinary.com/dzsvjyg2c/image/upload/v1766313043/50_srwqa0.png');
    const rightLogoBuffer = await fetchImageAsBuffer('https://res.cloudinary.com/dzsvjyg2c/image/upload/v1748249134/gyzoxsk22n0z1kkkh3di.png');

    // Create PDF
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Result_${result.grNumber}_${result.term}_${result.academicYear}.pdf`);

    doc.pipe(res);

    // Draw outer border
    doc.lineWidth(1.5).rect(20, 20, 555, 802).stroke('#000000');

    // ============ HEADER SECTION ============
    let currentY = 30;

    // Left Logo
    if (leftLogoBuffer) {
      try {
        doc.image(leftLogoBuffer, 35, currentY, { width: 70, height: 70 });
      } catch (error) {
        console.log('Could not load left logo:', error.message);
      }
    }

    // Right Logo
    if (rightLogoBuffer) {
      try {
        doc.image(rightLogoBuffer, 490, currentY, { width: 70, height: 70 });
      } catch (error) {
        console.log('Could not load right logo:', error.message);
      }
    }

    // Header Text Section - Centered between logos
    const headerTextX = 115;
    const headerTextWidth = 365;

    // Society Name (Small, top)
    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Devaraj Urs Education Society (R)', headerTextX, currentY + 5, { width: headerTextWidth, align: 'center' });

    // School Name (Large, Bold)
    doc.fontSize(16)
      .font('Helvetica-Bold')
      .text('KAMLI ANUPAM PRIMARY SCHOOL', headerTextX, currentY + 20, { width: headerTextWidth, align: 'center' });

    // College Code
    doc.fontSize(8)
      .font('Helvetica')
      .text('(School Code: KAP 001)', headerTextX, currentY + 38, { width: headerTextWidth, align: 'center' });

    // Address
    doc.fontSize(8)
      .font('Helvetica')
      .text('તાલુકોં :- unjhs',
        headerTextX, currentY + 50, { width: headerTextWidth, align: 'center' });

    currentY += 85;

    // Result Title
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text(`RESULT OF ${result.term || 'Term-1'} ${result.academicYear || '2024-25'}`,
        30, currentY, { width: 535, align: 'center' });

    currentY += 20;

    // ============ STUDENT INFORMATION TABLE ============
    const infoTableX = 40;
    const infoTableWidth = 515;
    const colWidth = infoTableWidth / 2;
    const rowHeight = 25;

    // Draw outer border for student info section
    const studentInfoStartY = currentY;

    // Row 1: Student Name | Class
    drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
      `Student's Name : ${student.name}`, { fontSize: 10, font: 'Helvetica' });
    drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
      `Class : ${formatStandard(result.standard)}`, { fontSize: 10, font: 'Helvetica' });
    currentY += rowHeight;

    // Row 2: GR Number | DOB
    drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
      `GR Number : ${student.grNumber}`, { fontSize: 10, font: 'Helvetica' });
    drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
      `DOB : ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}`, { fontSize: 10, font: 'Helvetica' });
    currentY += rowHeight;

    // Row 3: Academic Year | Section
    drawTableCell(doc, infoTableX, currentY, colWidth, rowHeight,
      `Academic Year : ${result.academicYear || '2024-25'}`, { fontSize: 10, font: 'Helvetica' });
    drawTableCell(doc, infoTableX + colWidth, currentY, colWidth, rowHeight,
      `Section : A`, { fontSize: 10, font: 'Helvetica' });
    currentY += rowHeight;

    // Outer border around student info section
    doc.rect(infoTableX, studentInfoStartY, infoTableWidth, rowHeight * 3)
      .lineWidth(1.5)
      .stroke('#000000');

    currentY += 10;

    // Horizontal separator line after student info
    doc.moveTo(40, currentY).lineTo(555, currentY)
      .lineWidth(1)
      .stroke('#000000');

    currentY += 20; // More spacing before marks table

    // ============ MARKS TABLE ============
    const marksTableX = 40;
    const marksTableWidth = 515;
    const snWidth = 40;
    const subjectWidth = 250;
    const maxMarksWidth = 112.5;
    const obtainedMarksWidth = 112.5;
    const headerHeight = 30;
    const dataRowHeight = 25;

    // Table Header (Gray background)
    drawTableCell(doc, marksTableX, currentY, snWidth, headerHeight,
      'SN', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
    drawTableCell(doc, marksTableX + snWidth, currentY, subjectWidth, headerHeight,
      'SUBJECTS', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
    drawTableCell(doc, marksTableX + snWidth + subjectWidth, currentY, maxMarksWidth, headerHeight,
      'MAXIMUM MARKS', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
    drawTableCell(doc, marksTableX + snWidth + subjectWidth + maxMarksWidth, currentY, obtainedMarksWidth, headerHeight,
      'OBTAINED MARKS', { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#808080', textColor: '#FFFFFF', bold: true });
    currentY += headerHeight;

    // Subject Rows
    let totalObtained = 0;
    let totalMax = 0;

    result.subjects.forEach((subject, index) => {
      // Alternate row colors (light pink/white)
      const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FFFFFF';

      // Safety checks for undefined marks - use correct field names: marks and maxMarks
      const totalMarks = subject.maxMarks || 0;
      const obtainedMarks = subject.marks || 0;

      drawTableCell(doc, marksTableX, currentY, snWidth, dataRowHeight,
        (index + 1).toString(), { fontSize: 10, align: 'center', bgColor: bgColor });
      drawTableCell(doc, marksTableX + snWidth, currentY, subjectWidth, dataRowHeight,
        subject.name || 'N/A', { fontSize: 10, bgColor: bgColor });
      drawTableCell(doc, marksTableX + snWidth + subjectWidth, currentY, maxMarksWidth, dataRowHeight,
        totalMarks.toString(), { fontSize: 10, align: 'center', bgColor: bgColor });
      drawTableCell(doc, marksTableX + snWidth + subjectWidth + maxMarksWidth, currentY, obtainedMarksWidth, dataRowHeight,
        obtainedMarks.toString(), { fontSize: 10, align: 'center', bgColor: bgColor });

      totalObtained += obtainedMarks;
      totalMax += totalMarks;
      currentY += dataRowHeight;
    });

    // Total Row (Light blue background)
    drawTableCell(doc, marksTableX, currentY, snWidth + subjectWidth + maxMarksWidth + obtainedMarksWidth, dataRowHeight,
      `Marks Obtained : ${totalObtained} Out Of ${totalMax}`, { fontSize: 10, font: 'Helvetica-Bold', align: 'center', bgColor: '#ADD8E6', bold: true });
    currentY += dataRowHeight;

    // Horizontal separator line
    doc.moveTo(marksTableX, currentY + 10).lineTo(marksTableX + marksTableWidth, currentY + 10)
      .lineWidth(1)
      .stroke('#000000');

    currentY += 30; // More spacing before percentage box

    // ============ PERCENTAGE AND RESULT BOX ============
    const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
    const resultStatus = percentage >= 35 ? 'PASS' : 'FAIL';
    const resultBoxHeight = 40;

    // Draw the full box with light yellow background
    doc.rect(marksTableX, currentY, marksTableWidth, resultBoxHeight)
      .fillAndStroke('#FFFACD', '#000000');

    // Left side - Percentage
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(`Percentage : ${percentage}`, marksTableX + 10, currentY + 13, { width: 150, align: 'left' });

    // Right side - Result
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(`Result : ${resultStatus}`, marksTableX + 365, currentY + 13, { width: 150, align: 'right' });

    currentY += resultBoxHeight + 10;

    // Horizontal separator line after percentage box
    doc.moveTo(40, currentY).lineTo(555, currentY)
      .lineWidth(1)
      .stroke('#000000');

    currentY += 20;

    // Remarks if present
    if (result.remarks) {
      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('Remarks: ', 40, currentY, { continued: true })
        .font('Helvetica')
        .text(result.remarks, { width: 515 });
      currentY += 30;
    }

    // ============ SIGNATURE SECTION ============
    currentY = 670; // Adjusted position to fit all sections

    // Draw border around signature section
    const signatureBoxHeight = 60;

    // Signature boxes
    const signatureY = currentY + 40;
    const signatureWidth = 170;

    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Class Teacher\'s Sign.', 40, signatureY, { width: signatureWidth, align: 'center' })
      .text('Office Seal', 210, signatureY, { width: signatureWidth, align: 'center' })
      .text('Principal\'s Sign.', 380, signatureY, { width: signatureWidth, align: 'center' });

    // Lines for signatures
    doc.moveTo(40, signatureY - 5).lineTo(200, signatureY - 5).stroke();
    doc.moveTo(210, signatureY - 5).lineTo(370, signatureY - 5).stroke();
    doc.moveTo(380, signatureY - 5).lineTo(540, signatureY - 5).stroke();

    currentY += signatureBoxHeight + 10;

    // Horizontal separator line after signature section
    doc.moveTo(40, currentY).lineTo(555, currentY)
      .lineWidth(1)
      .stroke('#000000');

    currentY += 10;

    // ============ DISCLAIMER ============
    doc.fontSize(7)
      .font('Helvetica-Bold')
      .fillColor('#FF0000')
      .text('Disclaimer : ', 40, currentY, { continued: true })
      .font('Helvetica')
      .fillColor('#000000')
      .text('Neither webmaster nor Result Hosting is responsible for any inadvertent error that may creep in the results being published on NET.', { width: 515 });

    doc.fontSize(7)
      .text('The results published on net are immediate information for Students. This cannot be treated as original mark sheet Until Signed Or Stamped By School Office.',
        40, currentY + 10, { width: 515 });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF generation error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
    }
  }
};
