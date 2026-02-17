import React, { useEffect, useState } from "react";
import axios from "../api/axios"; // Use configured axios
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchResults, deleteResult } from '../redux/slices/resultSlice';
import { ChevronDown, ChevronUp, User } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

// Utility function to format standard display consistently
const formatStandard = (standard) => {
  if (!standard) return 'N/A';
  const stdStr = String(standard).trim();

  // Check if it's Balvatika
  if (stdStr.toLowerCase().includes('balvatika') || stdStr.toLowerCase().includes('bal')) {
    return 'Balvatika';
  }

  // Extract number from various formats (9, Grade-9, STD-9, Standard 9, etc.)
  const match = stdStr.match(/\d+/);
  if (match) {
    return `STD-${match[0]}`;
  }

  // If no number found, return as is
  return stdStr;
};

const AdminResultView = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Filter states
  const [selectedStandard, setSelectedStandard] = useState("");
  const [searchName, setSearchName] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  // Group results by teacher
  const [groupedByTeacher, setGroupedByTeacher] = useState({});
  const [expandedTeachers, setExpandedTeachers] = useState({});

  // Get student context from URL params
  const [searchParams] = useSearchParams();
  const grNumberFromUrl = searchParams.get('grNumber');
  const [studentInfo, setStudentInfo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Get student info from localStorage if coming from Manage Students
    const storedInfo = localStorage.getItem('viewingStudentInfo');
    if (storedInfo) {
      setStudentInfo(JSON.parse(storedInfo));
      localStorage.removeItem('viewingStudentInfo');
    }
  }, []);

  const dispatch = useDispatch();
  // Select from Redux store
  const { results: reduxResults, loading: reduxLoading } = useSelector((state) => state.results);

  // Local state for enriched results
  // (State declarations handled at top of component)

  // ... rest of state definitions ...

  useEffect(() => {
    // Dispatch fetchResults action
    dispatch(fetchResults({ role: 'admin' }));
  }, [dispatch]);

  // Enrich results when reduxResults change
  useEffect(() => {
    const enrichResults = async () => {
      // If reduxResults are empty and loading is false, maybe we need to reload or just show empty
      if (reduxLoading) {
        setLoading(true);
        return;
      }

      try {
        // Try to fetch all teachers to map IDs to names
        // This part remains local as it's specific to enrichment and not part of global result state
        let teacherMap = new Map();
        try {
          const teachersRes = await axios.get("/admin/teachers-list");
          if (teachersRes.data && Array.isArray(teachersRes.data)) {
            teachersRes.data.forEach(teacher => {
              teacherMap.set(teacher._id, {
                name: teacher.name,
                employeeId: teacher.employeeId,
                email: teacher.email
              });
            });
          }
        } catch (error) {
          console.log('Could not fetch teachers list');
        }

        const enrichedResults = reduxResults.map(result => {
          // ... enrichment logic from original file ...
          // Reusing the same logic but applying it to reduxResults
          if (result.uploadedBy && typeof result.uploadedBy === 'string') {
            if (teacherMap.has(result.uploadedBy)) {
              return { ...result, uploadedBy: { _id: result.uploadedBy, ...teacherMap.get(result.uploadedBy) } };
            }
          } else if (result.uploadedBy && typeof result.uploadedBy === 'object' && !result.uploadedBy.name) {
            const teacherId = result.uploadedBy._id || result.uploadedBy;
            if (teacherMap.has(teacherId)) {
              return { ...result, uploadedBy: { _id: teacherId, ...teacherMap.get(teacherId) } };
            }
          }
          return result;
        });

        setResults(enrichedResults);

        // Initial filtering
        if (grNumberFromUrl) {
          setFilteredResults(enrichedResults.filter(r => r.grNumber === grNumberFromUrl));
        } else {
          setFilteredResults(enrichedResults);
        }
      } catch (error) {
        console.error("Error enriching results:", error);
      } finally {
        setLoading(false);
      }
    };

    enrichResults();
  }, [reduxResults, reduxLoading, grNumberFromUrl]);

  // Filter effect - runs whenever results, selectedStandard, searchName, or selectedTeacher changes
  useEffect(() => {
    let filtered = results;

    // Filter by standard
    if (selectedStandard && selectedStandard !== "") {
      filtered = filtered.filter(
        (student) => student.standard === selectedStandard
      );
    }

    // Filter by name (case-insensitive partial match)
    if (searchName.trim() !== "") {
      filtered = filtered.filter((student) =>
        student.studentName.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by teacher
    if (selectedTeacher && selectedTeacher !== "") {
      filtered = filtered.filter(
        (student) => student.uploadedBy?._id === selectedTeacher
      );
    }

    setFilteredResults(filtered);
  }, [results, selectedStandard, searchName, selectedTeacher]);

  // Group results by teacher whenever filteredResults changes
  useEffect(() => {
    const grouped = {};

    filteredResults.forEach((result) => {
      // Check if uploadedBy exists and is populated (object with _id)
      let teacherId, teacherName, employeeId;

      if (result.uploadedBy && typeof result.uploadedBy === 'object' && result.uploadedBy._id) {
        // uploadedBy is populated
        teacherId = result.uploadedBy._id;
        teacherName = result.uploadedBy.name || 'Unknown Teacher';
        employeeId = result.uploadedBy.employeeId || 'N/A';
      } else if (result.uploadedBy && typeof result.uploadedBy === 'string') {
        // uploadedBy is just an ID (not populated)
        teacherId = result.uploadedBy;
        teacherName = 'Teacher (ID: ' + result.uploadedBy.slice(-6) + ')';
        employeeId = 'N/A';
      } else {
        // No uploadedBy field - old data
        teacherId = 'legacy';
        teacherName = 'Legacy Results (No Teacher Info)';
        employeeId = 'N/A';
      }

      if (!grouped[teacherId]) {
        grouped[teacherId] = {
          teacherId,
          teacherName,
          employeeId,
          results: []
        };
      }

      grouped[teacherId].results.push(result);
    });

    // Sort teachers by name
    const sortedGrouped = Object.fromEntries(
      Object.entries(grouped).sort((a, b) =>
        a[1].teacherName.localeCompare(b[1].teacherName)
      )
    );

    setGroupedByTeacher(sortedGrouped);

    // Auto-expand all teachers initially
    const initialExpanded = {};
    Object.keys(sortedGrouped).forEach(teacherId => {
      initialExpanded[teacherId] = true;
    });
    setExpandedTeachers(initialExpanded);
  }, [filteredResults]);

  // Get unique standards for filter dropdown
  const getUniqueStandards = () => {
    const standards = results.map((student) => student.standard);
    return [...new Set(standards)].sort();
  };

  // Get unique teachers for filter dropdown
  const getUniqueTeachers = () => {
    const teachersMap = new Map();
    results.forEach(result => {
      // Only include if uploadedBy is populated with actual data
      if (result.uploadedBy && typeof result.uploadedBy === 'object' && result.uploadedBy._id && result.uploadedBy.name) {
        teachersMap.set(result.uploadedBy._id, {
          id: result.uploadedBy._id,
          name: result.uploadedBy.name,
          employeeId: result.uploadedBy.employeeId || 'N/A'
        });
      }
    });
    return Array.from(teachersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Toggle teacher section expand/collapse
  const toggleTeacher = (teacherId) => {
    setExpandedTeachers(prev => ({
      ...prev,
      [teacherId]: !prev[teacherId]
    }));
  };

  // Expand/collapse all teachers
  const expandAll = () => {
    const allExpanded = {};
    Object.keys(groupedByTeacher).forEach(teacherId => {
      allExpanded[teacherId] = true;
    });
    setExpandedTeachers(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed = {};
    Object.keys(groupedByTeacher).forEach(teacherId => {
      allCollapsed[teacherId] = false;
    });
    setExpandedTeachers(allCollapsed);
  };

  const confirmDelete = (id) => {
    const student = results.find((s) => s._id === id);
    setSelectedStudent(student);
    setSelectedId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedId) {
      alert("Something went wrong. No student selected.");
      return;
    }

    try {
      await dispatch(deleteResult(selectedId)).unwrap();

      // Removed manual filtering of results because Redux state update will trigger re-render
      // and the enrichment effect might re-run or we might rely on the store
      // However, since we have local state `results` that is sync'd from redux, 
      // we should either rely fully on redux or update local state manually for instant feedback.
      // The redux reducer updates the store, so `reduxResults` will change, triggering `enrichResults` again.

      setShowModal(false);
      toast.success("Result deleted successfully");
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("Failed to delete the result.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-result/${id}`);
  };

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Get all unique subjects across all students to create consistent columns
      const allSubjects = [];
      const subjectMap = new Map();

      filteredResults.forEach(student => {
        student.subjects.forEach(subject => {
          const key = subject.name;
          if (!subjectMap.has(key)) {
            subjectMap.set(key, subject.maxMarks);
            allSubjects.push({
              name: subject.name,
              maxMarks: subject.maxMarks
            });
          }
        });
      });

      // Prepare data for export (use filtered results)
      const exportData = filteredResults.map((student) => {
        const totalObtained = student.subjects.reduce((acc, subj) => acc + subj.marks, 0);
        const totalMax = student.subjects.reduce((acc, subj) => acc + subj.maxMarks, 0);
        const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 'N/A';

        // Create base student info
        const baseInfo = {
          'Student Name': student.studentName,
          'Standard': formatStandard(student.standard),
          'GR Number': student.grNumber,
          'Date of Birth': new Date(student.dateOfBirth).toLocaleDateString(),
          'Uploaded By': student.uploadedBy?.name || 'N/A',
          'Total Obtained Marks': totalObtained,
          'Total Maximum Marks': totalMax,
          'Percentage': percentage + '%',
          'Remarks': student.remarks || 'N/A'
        };

        // Add all subjects with consistent headers
        allSubjects.forEach((subjectInfo) => {
          const subjectHeader = `${subjectInfo.name} (${subjectInfo.maxMarks})`;

          // Find the student's marks for this subject
          const studentSubject = student.subjects.find(s => s.name === subjectInfo.name);
          baseInfo[subjectHeader] = studentSubject ? studentSubject.marks : '-';
        });

        return baseInfo;
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 20 }, // Student Name
        { wch: 12 }, // Standard
        { wch: 15 }, // GR Number
        { wch: 15 }, // Date of Birth
        { wch: 20 }, // Uploaded By
        { wch: 18 }, // Total Obtained
        { wch: 18 }, // Total Maximum
        { wch: 12 }, // Percentage
        { wch: 15 }, // Remarks
      ];

      // Add subject columns width
      allSubjects.forEach(() => {
        columnWidths.push({ wch: 18 });
      });

      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Results");

      // Generate filename with current date and filters
      let filename = `Student_Results_${new Date().toISOString().split('T')[0]}`;
      if (selectedStandard) {
        filename += `_Standard_${selectedStandard}`;
      }
      if (selectedTeacher) {
        const teacher = getUniqueTeachers().find(t => t.id === selectedTeacher);
        if (teacher) {
          filename += `_${teacher.name.replace(/\s+/g, '_')}`;
        }
      }
      if (searchName.trim()) {
        filename += `_${searchName.trim().replace(/\s+/g, '_')}`;
      }
      filename += '.xlsx';

      // Save file
      XLSX.writeFile(workbook, filename);

      // Show success message
      alert(`Excel file "${filename}" has been downloaded successfully!`);

    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export data to Excel. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          📘 Student Results
        </h2>

        {/* Student Context Banner */}
        {studentInfo && grNumberFromUrl && (
          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                {studentInfo.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-600">Viewing results for:</p>
                <p className="text-lg font-bold text-gray-900">
                  {studentInfo.name} <span className="text-gray-500 font-normal text-sm">({studentInfo.grNumber})</span>
                </p>
                <p className="text-sm text-blue-600">{formatStandard(studentInfo.standard)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                navigate('/admin/results');
                setStudentInfo(null);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all"
            >
              View All Results
            </button>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        {/* Filter Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="mr-2">🔍</span>
            Filter & Search
          </h3>
          <div className="flex gap-3">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <span>📊</span>
              Export to Excel
            </button>
            <button
              onClick={() => {
                setSelectedStandard("");
                setSearchName("");
                setSelectedTeacher("");
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border"
            >
              <span>✕</span>
              Clear All
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Standard Filter */}
          <div className="space-y-2">
            <label htmlFor="standard-filter" className="block text-sm font-semibold text-gray-700">
              Filter by Standard
            </label>
            <select
              id="standard-filter"
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700 font-medium"
            >
              <option value="">All Standards</option>
              {getUniqueStandards().map((standard) => (
                <option key={standard} value={standard}>
                  {formatStandard(standard)}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Filter */}
          <div className="space-y-2">
            <label htmlFor="teacher-filter" className="block text-sm font-semibold text-gray-700">
              Filter by Teacher
            </label>
            <select
              id="teacher-filter"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700 font-medium"
            >
              <option value="">All Teachers</option>
              {getUniqueTeachers().map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Name Search */}
          <div className="space-y-2">
            <label htmlFor="name-search" className="block text-sm font-semibold text-gray-700">
              Search by Student Name
            </label>
            <div className="relative">
              <input
                id="name-search"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Type student name here..."
                className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">🔍</span>
              </div>
              {searchName && (
                <button
                  onClick={() => setSearchName("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count & Active Filters */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium text-gray-800">
                Showing {filteredResults.length} of {results.length} results
              </span>
              {filteredResults.length > 0 && (
                <span className="ml-3 text-xs text-gray-500">
                  ({Object.keys(groupedByTeacher).length} teacher{Object.keys(groupedByTeacher).length !== 1 ? 's' : ''})
                </span>
              )}
            </div>

            {/* Active Filter Tags */}
            <div className="flex flex-wrap gap-2">
              {selectedStandard && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {formatStandard(selectedStandard)}
                  <button
                    onClick={() => setSelectedStandard("")}
                    className="ml-1 hover:text-blue-600"
                  >
                    ✕
                  </button>
                </span>
              )}
              {selectedTeacher && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Teacher: {getUniqueTeachers().find(t => t.id === selectedTeacher)?.name}
                  <button
                    onClick={() => setSelectedTeacher("")}
                    className="ml-1 hover:text-purple-600"
                  >
                    ✕
                  </button>
                </span>
              )}
              {searchName.trim() && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Name: "{searchName}"
                  <button
                    onClick={() => setSearchName("")}
                    className="ml-1 hover:text-green-600"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse All Controls */}
      {Object.keys(groupedByTeacher).length > 0 && (
        <div className="mb-4 flex justify-end gap-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-all"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-all"
          >
            Collapse All
          </button>
        </div>
      )}

      {/* Results Grouped by Teacher */}
      {Object.keys(groupedByTeacher).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedByTeacher).map(([teacherId, teacherData]) => {
            const isExpanded = expandedTeachers[teacherId];

            return (
              <div key={teacherId} className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                {/* Teacher Header */}
                <button
                  onClick={() => toggleTeacher(teacherId)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 flex items-center justify-between border-b border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-gray-900">
                        {teacherData.teacherName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Employee ID: {teacherData.employeeId} • {teacherData.results.length} result{teacherData.results.length !== 1 ? 's' : ''} uploaded
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                      {teacherData.results.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>

                {/* Results Table */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Student Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Standard
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            GR Number
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Date of Birth
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Total Marks
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Percentage
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {teacherData.results.map((student) => {
                          const totalObtained = student.subjects.reduce(
                            (acc, subj) => acc + subj.marks,
                            0
                          );
                          const totalMax = student.subjects.reduce(
                            (acc, subj) => acc + subj.maxMarks,
                            0
                          );
                          const percentage =
                            totalMax > 0
                              ? ((totalObtained / totalMax) * 100).toFixed(2)
                              : "N/A";

                          return (
                            <tr key={student._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{student.studentName}</td>
                              <td className="px-4 py-3 text-sm">{formatStandard(student.standard)}</td>
                              <td className="px-4 py-3 text-sm">{student.grNumber}</td>
                              <td className="px-4 py-3 text-sm">
                                {new Date(student.dateOfBirth).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                                {totalObtained}/{totalMax}
                              </td>
                              <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                                {percentage}%
                              </td>
                              <td className="px-4 py-3 text-sm flex gap-2">
                                <button
                                  onClick={() => handleEdit(student._id)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => confirmDelete(student._id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          {results.length === 0 ? (
            <p className="text-gray-500">😐 No results available</p>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">🔍 No results match your filters</p>
              <button
                onClick={() => {
                  setSelectedStandard("");
                  setSearchName("");
                  setSelectedTeacher("");
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && selectedStudent && (
        <div 
          className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-2">
              You are about to delete the result of:
            </p>
            <p className="font-medium text-red-600 mb-4">
              GR No: {selectedStudent.grNumber} — {selectedStudent.studentName}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action is irreversible.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResultView;
