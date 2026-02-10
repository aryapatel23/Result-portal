import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addResult } from '../redux/slices/resultSlice';
import { Plus, Trash2, Save, BookOpen, User } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

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
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(null);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [classTeacher, setClassTeacher] = useState(null); // The ONE class they're class teacher of
  const [formData, setFormData] = useState({
    studentName: '',
    grNumber: '',
    dateOfBirth: '',
    standard: '',
    term: 'Term-1',
    academicYear: '2024-25',
    subjects: [{ id: crypto.randomUUID(), name: '', marks: '', maxMarks: '100' }],
    remarks: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingStudent, setIsFetchingStudent] = useState(false);
  const [fetchTimeout, setFetchTimeout] = useState(null);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  useEffect(() => {
    // Get current user info
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setCurrentUser(user);
      // Fetch teacher's assigned classes
      if (user.role === 'teacher') {
        fetchTeacherInfo();
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeout) clearTimeout(fetchTimeout);
    };
  }, []);

  const fetchTeacherInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/teacher/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.teacher) {
        setClassTeacher(response.data.teacher.classTeacher); // The ONE class they're class teacher of
        setAssignedClasses(response.data.teacher.assignedClasses); // All classes they teach
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
    }
  };

  const fetchStudentByGR = async (grNumber) => {
    if (!grNumber || grNumber.length < 3) return; // Don't fetch until at least 3 characters

    setIsFetchingStudent(true);
    try {
      const response = await axios.get(`/student/gr/${grNumber}`);
      if (response.data.student) {
        const student = response.data.student;

        // Auto-fill student information
        setFormData(prev => ({
          ...prev,
          studentName: student.name || '',
          dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
          standard: student.standard || '',
        }));

        // Auto-load subjects for the standard
        if (student.standard && standardSubjects[student.standard]) {
          setFormData(prev => ({
            ...prev,
            subjects: standardSubjects[student.standard]
          }));
        }

        setIsAutoFilled(true);

        toast.success(`Student information loaded: ${student.name}`, {
          icon: '✅',
          duration: 3000,
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Student not found - clear the auto-filled fields
        setIsAutoFilled(false);
        toast.error('Student not found with this GR Number. Please enter details manually.', {
          duration: 4000,
        });
      } else {
        console.error('Error fetching student:', error);
      }
    } finally {
      setIsFetchingStudent(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "grNumber") {
      // Update GR number
      setFormData(prev => ({ ...prev, grNumber: value }));

      // Clear previous timeout
      if (fetchTimeout) clearTimeout(fetchTimeout);

      // Set new timeout for debounced fetch (wait 800ms after user stops typing)
      if (value.length >= 3) {
        const newTimeout = setTimeout(() => {
          fetchStudentByGR(value);
        }, 800);
        setFetchTimeout(newTimeout);
      }
    } else if (name === "standard") {
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

    // Use local isSubmitting for button state, but Redux handles the heavy lifting
    setIsSubmitting(true);

    try {
      // Dispatch the addResult thunk
      // We pass role so the thunk knows which endpoint to use
      const role = currentUser?.role || 'student'; // fallback, though currentUser should be there

      const resultAction = await dispatch(addResult({ resultData: formData, role }));

      if (addResult.fulfilled.match(resultAction)) {
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

        // Reset form
        setFormData({
          studentName: '',
          grNumber: '',
          dateOfBirth: '',
          standard: '',
          term: 'Term-1',
          academicYear: '2024-25',
          subjects: [{ id: crypto.randomUUID(), name: '', marks: '', maxMarks: '100' }],
          remarks: '',
        });

        setIsAutoFilled(false);

        // Navigate back based on role
        if (role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/admin/results');
        }
      } else {
        // Handle Redux rejection
        throw new Error(resultAction.payload || 'Failed to upload result');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload result. Please try again.');
      console.error('Error uploading result:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 flex items-center flex-wrap gap-2">
          <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600" />
          <span>Upload Student Result</span>
        </h1>
        <p className="text-gray-600 mt-2 text-xs sm:text-sm">
          Upload student results using the form below. You can add multiple subjects as needed.
        </p>
        {currentUser?.role === 'admin' && (
          <div className="flex justify-end mt-3 sm:mt-4">
            <button
              onClick={() => navigate('/admin/results')}
              className="flex items-center px-3 sm:px-4 py-2 text-sm sm:text-base rounded-md bg-green-600 text-white hover:bg-green-700 transition w-full sm:w-auto justify-center"
            >
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              View Results
            </button>
          </div>
        )}
      </div>

      {/* Current User Info */}
      {currentUser && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start sm:items-center">
            <div className="bg-indigo-100 rounded-full p-2 mr-3 flex-shrink-0">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-700">Uploading as:</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {currentUser.name}
                {currentUser.employeeId && (
                  <span className="ml-2 text-xs sm:text-sm text-gray-600">
                    ({currentUser.employeeId})
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                Role: {currentUser.role?.charAt(0).toUpperCase() + currentUser.role?.slice(1)}
              </p>
              {currentUser.role === 'teacher' && classTeacher && (
                <div className="mt-2 pt-2 border-t border-indigo-200">
                  <p className="text-xs sm:text-sm font-semibold text-indigo-700">
                    📚 Class Teacher of: <span className="text-indigo-900">{classTeacher}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    You can upload complete results only for {classTeacher}
                  </p>
                </div>
              )}
              {currentUser.role === 'teacher' && assignedClasses.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Teaching in: {assignedClasses.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 relative">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain pointer-events-none"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dzsvjyg2c/image/upload/v1748249134/gyzoxsk22n0z1kkkh3di.png')",
            backgroundSize: '200px sm:300px',
            opacity: 0.1,
            zIndex: 0,
          }}
        ></div>

        <form onSubmit={handleSubmit} className="relative z-10">

          {/* Student Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label htmlFor="studentName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Student Name *
              </label>
              <input
                type="text"
                id="studentName"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-blue-500 ${isAutoFilled ? 'bg-green-50 border-green-300' : 'border-gray-300'
                  }`}
                placeholder="Enter student's full name"
              />
              {isAutoFilled && (
                <p className="text-xs text-green-600 mt-1">✓ Auto-filled from student database</p>
              )}
            </div>

            <div>
              <label htmlFor="grNumber" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                GR Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="grNumber"
                  name="grNumber"
                  value={formData.grNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter GR number"
                />
                {isFetchingStudent && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Enter GR number to auto-fill student information
              </p>
            </div>
          </div>

          {/* DOB & Grade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label htmlFor="dateOfBirth" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-blue-500 ${isAutoFilled ? 'bg-green-50 border-green-300' : 'border-gray-300'
                  }`}
              />
              {isAutoFilled && (
                <p className="text-xs text-green-600 mt-1">✓ Auto-filled from student database</p>
              )}
            </div>

            <div>
              <label htmlFor="standard" className="block text-sm font-medium text-gray-700 mb-1">
                Standard *
              </label>
              <select
                id="standard"
                name="standard"
                value={formData.standard}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${isAutoFilled ? 'bg-green-50 border-green-300' : 'border-gray-300'
                  }`}
              >
                <option value="">Select Standard</option>
                {currentUser?.role === 'teacher' ? (
                  <>
                    <option value="">Select Standard</option>
                    {[...new Set([classTeacher, ...assignedClasses])].filter(Boolean).map(cls => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="Balvatika">Balvatika</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={`STD ${i + 1}`}>
                        STD-{i + 1}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {isAutoFilled && (
                <p className="text-xs text-green-600 mt-1">✓ Auto-filled from student database</p>
              )}
              {currentUser?.role === 'teacher' && classTeacher && (
                <p className="text-xs text-indigo-600 font-medium mt-1">
                  ✓ You can upload complete results for {classTeacher} (your class teacher class)
                </p>
              )}
              {currentUser?.role === 'teacher' && !classTeacher && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  ⚠️ No class teacher assignment found. Contact admin.
                </p>
              )}
            </div>
          </div>

          {/* Term & Academic Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label htmlFor="term" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Term *
              </label>
              <select
                id="term"
                name="term"
                value={formData.term}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="Term-1">Term-1</option>
                <option value="Term-2">Term-2</option>
                <option value="Mid-term">Mid-term</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div>
              <label htmlFor="academicYear" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                id="academicYear"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="e.g., 2024-25"
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Subjects */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Subjects *</label>
              <button
                type="button"
                onClick={handleAddSubject}
                className="flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50 w-full sm:w-auto justify-center sm:justify-start"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Add Subject
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {formData.subjects.map((subject) => (
                <div key={subject.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 p-3 sm:p-4 border rounded-md bg-gray-50">
                  <div className="sm:col-span-5">
                    <label className="block text-xs text-gray-500 mb-1">Subject Name</label>
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border rounded-md bg-gray-100"

                    />
                  </div>

                  <div className="sm:col-span-3">
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
                      className="w-full px-3 py-2 text-sm sm:text-base border rounded-md"
                    />

                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs text-gray-500 mb-1">Maximum Marks</label>
                    <input
                      type="number"
                      value={subject.maxMarks}
                      onChange={(e) => handleSubjectChange(subject.id, 'maxMarks', e.target.value)}
                      className="w-full px-3 py-2 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-end justify-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subject.id)}
                      className="text-red-500 hover:text-red-700 p-2 w-full sm:w-auto bg-red-50 hover:bg-red-100 rounded-md transition"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-4 sm:mb-6">
            <label htmlFor="remarks" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm sm:text-base border rounded-md"
              placeholder="Any additional comments or feedback for the student"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-md bg-blue-600 text-white transition w-full sm:w-auto justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Upload Result
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







