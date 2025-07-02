import * as XLSX from 'xlsx';
import React, { useState } from 'react';
import ExcelUpload from './ExcelUpload';


function ExcelUpload({ setFormData }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      // Read first sheet
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Expected Format: [[Subject, Marks, MaxMarks], ...]
      const subjects = data.slice(1).map((row, index) => ({
        id: index + 1,
        subject: row[0] || '',
        marks: row[1] || '',
        maxMarks: row[2] || '',
      }));

      // Set form data
      setFormData((prevData) => ({
        ...prevData,
        subjects: subjects,
      }));
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="mt-4">
      <label className="block font-semibold mb-2">Upload Excel File:</label>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
    </div>
  );
}

export default ExcelUpload;
