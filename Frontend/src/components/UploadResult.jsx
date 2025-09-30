import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

// 🎯 Subject mappings based on selected standard
const standardSubjects = {
  "STD 8": [
    { id: crypto.randomUUID(), name: "Gujrati", marks: "", maxMarks: "200" },
    { id: crypto.randomUUID(), name: "Math", marks: "", maxMarks: "200" },
    { id: crypto.randomUUID(), name: "Science", marks: "", maxMarks: "200" },
    { id: crypto.randomUUID(), name: "Hindi", marks: "", maxMarks: "200" },
    { id: crypto.randomUUID(), name: "English", marks: "", maxMarks: "200" },
    { id: crypto.randomUUID(), name: "Social Science", marks: "", maxMarks: "200" },
    { id: crypto.randomUUID(), name: "Sanskrit", marks: "", maxMarks: "200" },
    { id: crypto.randomUUID(), name: "Personality Development", marks: "", maxMarks: "400" },
  ],
  "STD 7": [
    { id: crypto.randomUUID(), name: "Math", marks: "", maxMarks: "100" },
    { id: crypto.randomUUID(), name: "Science", marks: "", maxMarks: "100" },
    { id: crypto.randomUUID(), name: "Hindi", marks: "", maxMarks: "80" },
    { id: crypto.randomUUID(), name: "English", marks: "", maxMarks: "80" },
  ],
  // Add more grades here if needed
};

const TeacherPanel = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: '',
    grNumber: '',
    dateOfBirth: '',
    standard: '',
    subjects: [{ id: crypto.randomUUID(), name: '', marks: '', maxMarks: '100' }],
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "standard") {
      setFormData((prev) => ({
        ...prev,
        standard: value,
        subjects: standardSubjects[value] || [{ id: crypto.randomUUID(), name: "", marks: "", maxMarks: "100" }],
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubjectChange = (id, field, value) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.map((subject) =>
        subject.id === id ? { ...subject, [field]: value } : subject
      ),
    });
  };

  const handleAddSubject = () => {
    setFormData({
      ...formData,
      subjects: [
        ...formData.subjects,
        { id: crypto.randomUUID(), name: '', marks: '', maxMarks: '100' },
      ],
    });
  };

  const handleRemoveSubject = (id) => {
    if (formData.subjects.length === 1) {
      toast.error('At least one subject is required');
      return;
    }

    setFormData({
      ...formData,
      subjects: formData.subjects.filter((subject) => subject.id !== id),
    });
  };

  const validateForm = () => {
    if (!formData.studentName.trim()) {
      toast.error('Student name is required');
      return false;
    }

    if (!formData.grNumber.trim()) {
      toast.error('GR number is required');
      return false;
    }

    if (!formData.dateOfBirth.trim()) {
      toast.error('Date of Birth is required');
      return false;
    }

    if (!formData.standard.trim()) {
      toast.error('Standard is required');
      return false;
    }


    for (const subject of formData.subjects) {
      if (!subject.name.trim()) {
        toast.error('All subject names are required');
        return false;
      }

      if (!subject.marks.trim()) {
        toast.error(`Marks are required for ${subject.name}`);
        return false;
      }

      const marks = parseFloat(subject.marks);
      const maxMarks = parseFloat(subject.maxMarks);

      if (isNaN(marks)) {
        toast.error(`Marks must be a valid number for ${subject.name}`);
        return false;
      }

      if (marks < 0) {
        toast.error(`Marks must be a positive number for ${subject.name}`);
        return false;
      }

      if (isNaN(maxMarks)) {
        toast.error(`Maximum marks must be a valid number for ${subject.name}`);
        return false;
      }

      if (marks > maxMarks) {
        toast.error(`Marks for ${subject.name} cannot exceed maximum (${maxMarks})`);
        return false;
      }
    }


    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('https://result-portal-tkom.onrender.com/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload result');
      }

      toast.success(`Result for GR No. ${formData.grNumber} uploaded successfully`, {
        duration: 4000,
        position: 'bottom-right',
        style: {
          border: '1px solid #4ade80',
          padding: '12px 16px',
          color: '#166534',
        },
        iconTheme: {
          primary: '#22c55e',
          secondary: '#f0fdf4',
        },
      });

      setFormData({
        studentName: '',
        grNumber: '',
        dateOfBirth: '',
        standard: '',
        subjects: [{ id: crypto.randomUUID(), name: '', marks: '', maxMarks: '100' }],
        remarks: '',
      });
    } catch (error) {
      toast.error(error.message || 'Failed to upload result. Please try again.');
      console.error('Error uploading result:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <BookOpen className="mr-2 h-8 w-8 text-blue-600" />
          Teacher Panel
        </h1>
        <p className="text-gray-600 mt-2">
          Upload student results using the form below. You can add multiple subjects as needed.
        </p>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => navigate('/admin/results')}
            className="flex items-center px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Results
          </button>
        </div>
      </div>


      <div className="bg-white rounded-lg shadow-md p-6">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain pointer-events-none"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dzsvjyg2c/image/upload/v1748249134/gyzoxsk22n0z1kkkh3di.png')",
            backgroundSize: '300px  ',
            opacity: 0.1,
            zIndex: 0,
          }}
        ></div>

        <form onSubmit={handleSubmit}>
          
          {/* Student Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter student's full name"
              />
            </div>

            <div>
              <label htmlFor="grNumber" className="block text-sm font-medium text-gray-700 mb-1">
                GR Number *
              </label>
              <input
                type="text"
                id="grNumber"
                name="grNumber"
                value={formData.grNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter GR number"
              />
            </div>
          </div>

          {/* DOB & Grade */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="standard" className="block text-sm font-medium text-gray-700 mb-1">
                Standard (Standard) *
              </label>
              <select
                id="standard"
                name="standard"
                value={formData.standard}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Standard</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={`STD ${i + 1}`}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subjects */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Subjects *</label>
              <button
                type="button"
                onClick={handleAddSubject}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Subject
              </button>
            </div>

            <div className="space-y-4">
              {formData.subjects.map((subject) => (
                <div key={subject.id} className="grid grid-cols-12 gap-4 p-4 border rounded-md bg-gray-50">
                  <div className="col-span-12 sm:col-span-5">
                    <label className="block text-xs text-gray-500 mb-1">Subject Name</label>
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"

                    />
                  </div>

                  <div className="col-span-5 sm:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">Marks Obtained</label>
                    <input
                      type="number"
                      value={subject.marks}
                      onChange={(e) => {
                        const value = e.target.value;
                        const max = parseFloat(subject.maxMarks || 0);

                        // Only allow empty string (for deletion) or value <= maxMarks
                        if (value === '' || parseFloat(value) <= max) {
                          handleSubjectChange(subject.id, 'marks', value);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    />

                  </div>

                  <div className="col-span-5 sm:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">Maximum Marks</label>
                    <input
                      type="text"
                      value={subject.maxMarks}
                      onChange={(e) => handleSubjectChange(subject.id, 'maxMarks', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                      readOnly
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1 flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subject.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-6">
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Any additional comments or feedback for the student"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-6 py-2 rounded-md bg-blue-600 text-white transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Upload Result
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherPanel;







