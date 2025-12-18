// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const AdminResultView = () => {
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedId, setSelectedId] = useState(null);

//   useEffect(() => {
//     const fetchResults = async () => {
//       try {
//         const res = await axios.get('https://result-portal-tkom.onrender.com/api/results/admin');
//         setResults(res.data);
//       } catch (error) {
//         console.error('Error fetching results:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResults();
//   }, []);

//   const confirmDelete = (id) => {
//     const student = results.find((s) => s._id === id);
//     setSelectedStudent(student);
//     setSelectedId(id);
//     setShowModal(true);
//   };

//   const handleDelete = async () => {
//     if (!selectedId) {
//       alert('Something went wrong. No student selected.');
//       return;
//     }

//     try {
//       await axios.delete(`https://result-portal-tkom.onrender.com/api/results/${selectedId}`);
//       setResults(results.filter((result) => result._id !== selectedId));
//       setShowModal(false);
//     } catch (error) {
//       console.error('Error deleting result:', error);
//       alert('Failed to delete the result.');
//     }
//   };


//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-6 relative">
//       <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">📘 All Student Results</h2>

//       {Array.isArray(results) && results.length > 0 ? (
//         <div className="overflow-x-auto shadow-md rounded-lg border border-gray-300">
//           <table className="min-w-full bg-white divide-y divide-gray-200">
//             <thead className="bg-blue-100 text-blue-900">
//               <tr>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">Standard</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">GR Number</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">Date of Birth</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">Total Marks</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">Percentage</th>
//                 <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {results.map((student) => {
//                 const totalObtained = student.subjects.reduce((acc, subj) => acc + subj.marks, 0);
//                 const totalMax = student.subjects.reduce((acc, subj) => acc + subj.maxMarks, 0);
//                 const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 'N/A';

//                 return (
//                   <tr key={student._id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3 text-sm">{student.studentName}</td>
//                     <td className="px-4 py-3 text-sm">{student.standard}</td>
//                     <td className="px-4 py-3 text-sm">{student.grNumber}</td>
//                     <td className="px-4 py-3 text-sm">
//                       {new Date(student.dateOfBirth).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-800 font-medium">
//                       {totalObtained}/{totalMax}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-green-600 font-semibold">{percentage}%</td>
//                     <td className="px-4 py-3 text-sm">
//                       {/* <button
//                         onClick={() => confirmDelete(student._id)}
//                         className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
//                       >
//                         Delete
//                       </button> */}
//                       <button
//                         onClick={() => {
//                           setSelectedStudent(student);       // for modal display
//                           setSelectedId(student._id);        // for delete API use
//                           setShowModal(true);
//                         }}
//                         className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
//                       >
//                         Delete
//                       </button>



//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <p className="text-center text-gray-500 mt-8">😐 No results available</p>
//       )}

//       {showModal && selectedStudent && (
//         <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-sm">
//           <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md text-center">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Are you sure?</h3>
//             <p className="text-gray-600 mb-2">
//               You are about to delete the result of:
//             </p>
//             <p className="font-medium text-red-600 mb-4">
//               GR No: {selectedStudent.grNumber} — {selectedStudent.studentName}
//             </p>
//             <p className="text-sm text-gray-500 mb-6">This action is irreversible.</p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={handleDelete}
//                 className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//               >
//                 Yes, Delete
//               </button>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}


//     </div>
//   );
// };

// export default AdminResultView;




import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

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

  const navigate = useNavigate(); // <-- for redirection

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(
          "https://result-portal-tkom.onrender.com/api/results/admin"
        );
        setResults(res.data);
        setFilteredResults(res.data); // Initialize filtered results
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // Filter effect - runs whenever results, selectedStandard, or searchName changes
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

    setFilteredResults(filtered);
  }, [results, selectedStandard, searchName]);

  // Get unique standards for filter dropdown
  const getUniqueStandards = () => {
    const standards = results.map((student) => student.standard);
    return [...new Set(standards)].sort();
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
      await axios.delete(
        `https://result-portal-tkom.onrender.com/api/results/${selectedId}`
      );
      const updatedResults = results.filter((result) => result._id !== selectedId);
      setResults(updatedResults);
      setFilteredResults(updatedResults.filter(student => {
        const matchesStandard = !selectedStandard || student.standard === selectedStandard;
        const matchesName = !searchName.trim() || student.studentName.toLowerCase().includes(searchName.toLowerCase());
        return matchesStandard && matchesName;
      }));
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("Failed to delete the result.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-result/${id}`); // redirect to upload page with id
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
          'Standard': student.standard,
          'GR Number': student.grNumber,
          'Date of Birth': new Date(student.dateOfBirth).toLocaleDateString(),
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
        { wch: 18 }, // Total Obtained
        { wch: 18 }, // Total Maximum
        { wch: 12 }, // Percentage
        { wch: 15 }, // Remarks
      ];
      
      // Add subject columns width - one column per unique subject
      allSubjects.forEach(() => {
        columnWidths.push({ wch: 18 }); // Subject with marks
      });
      
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Results");

      // Generate filename with current date and filters
      let filename = `Student_Results_${new Date().toISOString().split('T')[0]}`;
      if (selectedStandard) {
        filename += `_Standard_${selectedStandard}`;
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
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        📘 All Student Results
      </h2>

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
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 border"
            >
              <span>✕</span>
              Clear All
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Standard {standard}
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
                  (Ready for export)
                </span>
              )}
            </div>
            
            {/* Active Filter Tags */}
            <div className="flex flex-wrap gap-2">
              {selectedStandard && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Standard: {selectedStandard}
                  <button
                    onClick={() => setSelectedStandard("")}
                    className="ml-1 hover:text-blue-600"
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

      {Array.isArray(filteredResults) && filteredResults.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-300">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Student Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Standard
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  GR Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Date of Birth
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Total Marks
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Percentage
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResults.map((student) => {
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
                    <td className="px-4 py-3 text-sm">{student.standard}</td>
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
      ) : (
        <div className="text-center py-8">
          {results.length === 0 ? (
            <p className="text-gray-500">😐 No results available</p>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">� No results match your filters</p>
              <button
                onClick={() => {
                  setSelectedStandard("");
                  setSearchName("");
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
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md text-center">
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
