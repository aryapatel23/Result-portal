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

const AdminResultView = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const navigate = useNavigate(); // <-- for redirection

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(
          "https://result-portal-tkom.onrender.com/api/results/admin"
        );
        setResults(res.data);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

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
      setResults(results.filter((result) => result._id !== selectedId));
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("Failed to delete the result.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/edit-result/${id}`); // redirect to upload page with id
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

      {Array.isArray(results) && results.length > 0 ? (
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
              {results.map((student) => {
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
        <p className="text-center text-gray-500 mt-8">
          😐 No results available
        </p>
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
