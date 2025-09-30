// import React, { useState } from 'react';
// import { Search, FileText, Award, User, BookOpen } from 'lucide-react';
// import toast from 'react-hot-toast';

// const MOCK_RESULTS = {
//   "GR12345-2005-03-15": {
//     studentName: "John Smith",
//     grNumber: "GR12345",
//     dateOfBirth: "2005-03-15",
//     standard: "Grade 10",
//     subjects: [
//       { name: "Mathematics", marks: 85, maxMarks: 100 },
//       { name: "Science", marks: 92, maxMarks: 100 },
//       { name: "English", marks: 78, maxMarks: 100 },
//       { name: "History", marks: 88, maxMarks: 100 },
//       { name: "Computer Science", marks: 95, maxMarks: 100 },
//     ],
//     remarks: "Excellent performance overall. Keep up the good work!",
//     totalMarks: 438,
//     totalMaxMarks: 500,
//     percentage: 87.6
//   },
//   "GR54321-2003-07-22": {
//     studentName: "Emma Johnson",
//     grNumber: "GR54321",
//     dateOfBirth: "2003-07-22",
//     standard: "Grade 12",
//     subjects: [
//       { name: "Physics", marks: 90, maxMarks: 100 },
//       { name: "Chemistry", marks: 85, maxMarks: 100 },
//       { name: "Mathematics", marks: 95, maxMarks: 100 },
//       { name: "English", marks: 80, maxMarks: 100 },
//       { name: "Computer Science", marks: 98, maxMarks: 100 },
//     ],
//     remarks: "Outstanding performance in all subjects, especially in Computer Science.",
//     totalMarks: 448,
//     totalMaxMarks: 500,
//     percentage: 23
//   }
// };

// const StudentPanel = () => {
//   const [searchParams, setSearchParams] = useState({ grNumber: '', dateOfBirth: '' });
//   const [result, setResult] = useState(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searched, setSearched] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setSearchParams({ ...searchParams, [name]: value });
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();
//     if (!searchParams.grNumber.trim()) return toast.error('GR Number is required');
//     if (!searchParams.dateOfBirth) return toast.error('Date of Birth is required');

//     setIsSearching(true);
//     setSearched(true);
//     await new Promise(resolve => setTimeout(resolve, 1000));

//     const resultKey = `${searchParams.grNumber}-${searchParams.dateOfBirth}`;
//     const studentResult = MOCK_RESULTS[resultKey];

//     if (studentResult) setResult(studentResult);
//     else {
//       setResult(null);
//       toast.error('No results found. Please check your GR Number and Date of Birth.');
//     }
//     setIsSearching(false);
//   };

//   const getGrade = (percentage) => {
//     if (percentage >= 80) return 'A';
//     if (percentage >= 65) return 'B';
//     if (percentage >= 50) return 'C';
//     if (percentage >= 35) return 'D';
//     return 'F';
//   };

//   const getStatusColor = (marks, maxMarks) => {
//     const percentage = (marks / maxMarks) * 100;
//     if (percentage >= 80) return 'text-green-600';
//     if (percentage >= 60) return 'text-blue-600';
//     if (percentage >= 40) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   return (
//     <div className="max-w-5xl mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center">
//           <FileText className="mr-2 h-8 w-8 text-green-600" />
//           Student Result Portal
//         </h1>
//         <p className="text-gray-600 mt-2 text-sm sm:text-base">
//           Enter your GR Number and Date of Birth to view your result.
//         </p>
//       </div>

//       <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
//         <form onSubmit={handleSearch}>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
//             <div>
//               <label htmlFor="grNumber" className="block text-sm font-medium text-gray-700 mb-1">
//                 GR Number *
//               </label>
//               <input
//                 type="text"
//                 id="grNumber"
//                 name="grNumber"
//                 value={searchParams.grNumber}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
//                 placeholder="Enter your GR number"
//               />
//             </div>

//             <div>
//               <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
//                 Date of Birth *
//               </label>
//               <input
//                 type="date"
//                 id="dateOfBirth"
//                 name="dateOfBirth"
//                 value={searchParams.dateOfBirth}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
//               />
//             </div>
//           </div>

//           <div className="flex justify-end">
//             <button
//               type="submit"
//               disabled={isSearching}
//               className={`flex items-center px-6 py-2 rounded-md bg-green-600 text-white font-medium ${
//                 isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
//               }`}
//             >
//               {isSearching ? (
//                 <>
//                   <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                   </svg>
//                   Searching...
//                 </>
//               ) : (
//                 <>
//                   <Search className="mr-2 h-5 w-5" /> View Result
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       {searched && (
//         <>
//           {result ? (
//             <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 animate-fadeIn">
//               <div className="border-b pb-4 mb-6">
//                 <div className="flex flex-col sm:flex-row justify-between sm:items-center">
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
//                       <User className="mr-2 h-6 w-6 text-blue-600" />
//                       {result.studentName}
//                     </h2>
//                     <div className="flex flex-col sm:flex-row sm:space-x-8">
//                       <p className="text-gray-600"><span className="font-medium">GR Number:</span> {result.grNumber}</p>
//                       <p className="text-gray-600"><span className="font-medium">Standard:</span> {result.standard}</p>
//                     </div>
//                   </div>
//                   <div className="flex flex-col items-center mt-4 sm:mt-0">
//                     <div className="bg-blue-50 rounded-full p-3 mb-2">
//                       <Award className="h-8 w-8 text-blue-600" />
//                     </div>
//                     <p className="text-lg font-bold text-blue-600">{getGrade(result.percentage)}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                   <BookOpen className="mr-2 h-5 w-5 text-green-600" />
//                   Subject-wise Performance
//                 </h3>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full border-collapse">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Subject</th>
//                         <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Marks</th>
//                         <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Max</th>
//                         <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">%</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {result.subjects.map((subject, index) => (
//                         <tr key={index} className="hover:bg-gray-50">
//                           <td className="px-4 py-3 text-sm font-medium text-gray-800">{subject.name}</td>
//                           <td className={`px-4 py-3 text-sm text-center ${getStatusColor(subject.marks, subject.maxMarks)}`}>{subject.marks}</td>
//                           <td className="px-4 py-3 text-sm text-center">{subject.maxMarks}</td>
//                           <td className={`px-4 py-3 text-sm text-center font-medium ${getStatusColor(subject.marks, subject.maxMarks)}`}>
//                             {((subject.marks / subject.maxMarks) * 100).toFixed(1)}%
//                           </td>
//                         </tr>
//                       ))}
//                       <tr className="bg-gray-50 font-semibold">
//                         <td className="px-4 py-3">Total</td>
//                         <td className="px-4 py-3 text-center">{result.totalMarks}</td>
//                         <td className="px-4 py-3 text-center">{result.totalMaxMarks}</td>
//                         <td className="px-4 py-3 text-center">{result.percentage.toFixed(1)}%</td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {result.remarks && (
//                 <div className="bg-blue-50 rounded-lg p-4 text-gray-700">
//                   <h4 className="font-semibold text-gray-800 mb-1">Remarks:</h4>
//                   <p>{result.remarks}</p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="bg-white rounded-lg shadow-md p-6 text-center animate-fadeIn">
//               <div className="inline-block p-4 rounded-full bg-yellow-100 mb-4">
//                 <Search className="h-8 w-8 text-yellow-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">No Results Found</h3>
//               <p className="text-gray-600">Please verify your GR Number and Date of Birth and try again.</p>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default StudentPanel;


// import React, { useState } from 'react';
// import { Search, FileText, Award, User, BookOpen } from 'lucide-react';
// import toast from 'react-hot-toast';

// const StudentPanel = () => {
//   const [searchParams, setSearchParams] = useState({ grNumber: '', dateOfBirth: '' });
//   const [result, setResult] = useState(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searched, setSearched] = useState(false);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setSearchParams({ ...searchParams, [name]: value });
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();

//     if (!searchParams.grNumber.trim()) return toast.error('GR Number is required');
//     if (!searchParams.dateOfBirth) return toast.error('Date of Birth is required');

//     setIsSearching(true);
//     setSearched(true);

//     try {
//       const response = await fetch(
//         `https://result-portal-tkom.onrender.com/api/results?grNumber=${searchParams.grNumber}&dateOfBirth=${searchParams.dateOfBirth}`
//       );
//       const data = await response.json();

//       if (response.ok && data) {
//         setResult(data);
//       } else {
//         setResult(null);
//         toast.error(data.message || 'No results found. Please check your GR Number and Date of Birth.');
//       }
//     } catch (error) {
//       setResult(null);
//       toast.error('Something went wrong. Please try again later.');
//       console.error(error);
//     }

//     setIsSearching(false);
//   };

//   const getGrade = (percentage) => {
//     if (percentage >= 80) return 'A';
//     if (percentage >= 65) return 'B';
//     if (percentage >= 50) return 'C';
//     if (percentage >= 35) return 'D';
//     return 'F';
//   };

//   const getStatusColor = (marks, maxMarks) => {
//     const percentage = (marks / maxMarks) * 100;
//     if (percentage >= 80) return 'text-green-600';
//     if (percentage >= 60) return 'text-blue-600';
//     if (percentage >= 40) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   return (
//     <div className="max-w-5xl mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center">
//           <FileText className="mr-2 h-8 w-8 text-green-600" />
//           Student Result Portal
//         </h1>
//         <p className="text-gray-600 mt-2 text-sm sm:text-base">
//           Enter your GR Number and Date of Birth to view your result.
//         </p>
//       </div>

//       <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
//         <form onSubmit={handleSearch}>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
//             <div>
//               <label htmlFor="grNumber" className="block text-sm font-medium text-gray-700 mb-1">
//                 GR Number *
//               </label>
//               <input
//                 type="text"
//                 id="grNumber"
//                 name="grNumber"
//                 value={searchParams.grNumber}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
//                 placeholder="Enter your GR number"
//               />
//             </div>

//             <div>
//               <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
//                 Date of Birth *
//               </label>
//               <input
//                 type="date"
//                 id="dateOfBirth"
//                 name="dateOfBirth"
//                 value={searchParams.dateOfBirth}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
//               />
//             </div>
//           </div>

//           <div className="flex justify-end">
//             <button
//               type="submit"
//               disabled={isSearching}
//               className={`flex items-center px-6 py-2 rounded-md bg-green-600 text-white font-medium ${isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
//                 }`}
//             >
//               {isSearching ? (
//                 <>
//                   <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
//                   </svg>
//                   Searching...
//                 </>
//               ) : (
//                 <>
//                   <Search className="mr-2 h-5 w-5" /> View Result
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>

//       {searched && (
//         <>
//           {result ? (
//             <div
//               className="rounded-lg shadow-md p-4 sm:p-6 "
//             >
//               <div
//                 className="bg-white bg-opacity-90 rounded-lg p-4 sm:p-6 bg-no-repeat bg-center bg-contain"
//               >
//                 <div className="border-b pb-4 mb-6">
//                   <div className="flex flex-col sm:flex-row justify-between sm:items-center">
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
//                         <User className="mr-2 h-6 w-6 text-blue-600" />
//                         {result.studentName}
//                       </h2>
//                       <div className="flex flex-col sm:flex-row sm:space-x-8">
//                         <p className="text-gray-600">
//                           <span className="font-medium">GR Number:</span> {result.grNumber}
//                         </p>
//                         <p className="text-gray-600">
//                           <span className="font-medium">Standard:</span> {result.standard}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex flex-col items-center mt-4 sm:mt-0">
//                       <div className="bg-blue-50 rounded-full p-3 mb-2">
//                         <Award className="h-8 w-8 text-blue-600" />
//                       </div>
//                       <p className="text-lg font-bold text-blue-600">
//                         {getGrade(result.percentage)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                     <BookOpen className="mr-2 h-5 w-5 text-green-600" />
//                     Subject-wise Performance
//                   </h3>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full border-collapse">
//                       <thead className="bg-gray-100">
//                         <tr>
//                           <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
//                             Subject
//                           </th>
//                           <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">
//                             Marks
//                           </th>
//                           <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">
//                             Max
//                           </th>
//                           <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">
//                             %
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {result.subjects.map((subject, index) => (
//                           <tr key={index} className="hover:bg-gray-50">
//                             <td className="px-4 py-3 text-sm font-medium text-gray-800">
//                               {subject.name}
//                             </td>
//                             <td
//                               className={`px-4 py-3 text-sm text-center ${getStatusColor(
//                                 subject.marks,
//                                 subject.maxMarks
//                               )}`}
//                             >
//                               {subject.marks}
//                             </td>
//                             <td className="px-4 py-3 text-sm text-center">{subject.maxMarks}</td>
//                             <td
//                               className={`px-4 py-3 text-sm text-center font-medium ${getStatusColor(
//                                 subject.marks,
//                                 subject.maxMarks
//                               )}`}
//                             >
//                               {((subject.marks / subject.maxMarks) * 100).toFixed(1)}%
//                             </td>
//                           </tr>
//                         ))}
//                         <tr className="bg-gray-50 font-semibold">
//                           <td className="px-4 py-3">Total</td>
//                           <td className="px-4 py-3 text-center">{result.totalMarks}</td>
//                           <td className="px-4 py-3 text-center">{result.totalMaxMarks}</td>
//                           <td className="px-4 py-3 text-center">
//                             {Number(result.percentage).toFixed(1)}%
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 {result.remarks && (
//                   <div className="bg-blue-50 rounded-lg p-4 text-gray-700">
//                     <h4 className="font-semibold text-gray-800 mb-1">Remarks:</h4>
//                     <p>{result.remarks}</p>
//                   </div>
//                 )}
//               </div>

//             </div>
//           ) : (
//             <div className="bg-white rounded-lg shadow-md p-6 text-center animate-fadeIn">
//               <div className="inline-block p-4 rounded-full bg-yellow-100 mb-4">
//                 <Search className="h-8 w-8 text-yellow-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                 No Results Found
//               </h3>
//               <p className="text-gray-600">
//                 Please verify your GR Number and Date of Birth and try again.
//               </p>
//             </div>
//           )}
//         </>
//       )}


//     </div>
//   );
// };

// export default StudentPanel;










import React, { useState } from 'react';
import { Search, FileText, Award, User, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const StudentPanel = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useState({ grNumber: '', dateOfBirth: '' });
  const [result, setResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchParams.grNumber.trim()) return toast.error(t("errors.grNumberRequired"));
    if (!searchParams.dateOfBirth) return toast.error(t("errors.dobRequired"));

    setIsSearching(true);
    setSearched(true);

    try {
      const response = await fetch(
        `https://result-portal-tkom.onrender.com/api/results?grNumber=${searchParams.grNumber}&dateOfBirth=${searchParams.dateOfBirth}`
      );
      const data = await response.json();

      if (response.ok && data) {
        setResult(data);
      } else {
        setResult(null);
        toast.error(data.message || t("errors.noResults"));
      }
    } catch (error) {
      setResult(null);
      toast.error(t("errors.general"));
      console.error(error);
    }

    setIsSearching(false);
  };

  const getGrade = (percentage) => {
    if (percentage >= 80) return 'A';
    if (percentage >= 65) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  };

  const getStatusColor = (marks, maxMarks) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center">
          <FileText className="mr-2 h-8 w-8 text-green-600" />
          {t("studentPanel.title")}
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          {t("studentPanel.subtitle")}
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="grNumber" className="block text-sm font-medium text-gray-700 mb-1">
                {t("studentPanel.grNumber")} *
              </label>
              <input
                type="text"
                id="grNumber"
                name="grNumber"
                value={searchParams.grNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder={t("studentPanel.grPlaceholder")}
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                {t("studentPanel.dob")} *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={searchParams.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSearching}
              className={`flex items-center px-6 py-2 rounded-md bg-green-600 text-white font-medium ${isSearching ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
                }`}
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {t("studentPanel.searching")}
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" /> {t("studentPanel.viewResult")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Section */}
      {searched && (
        <>
          {result ? (
            <div className="rounded-lg shadow-md p-4 sm:p-6">
              <div className="bg-white bg-opacity-90 rounded-lg p-4 sm:p-6">
                {/* Student Info */}
                <div className="border-b pb-4 mb-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
                        <User className="mr-2 h-6 w-6 text-blue-600" />
                        {result.studentName}
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:space-x-8">
                        <p className="text-gray-600">
                          <span className="font-medium">{t("studentPanel.grNumber")}:</span> {result.grNumber}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">{t("studentPanel.standard")}:</span> {result.standard}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center mt-4 sm:mt-0">
                      <div className="bg-blue-50 rounded-full p-3 mb-2">
                        <Award className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {getGrade(result.percentage)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject-wise table */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-green-600" />
                    {t("studentPanel.subjectPerformance")}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                            {t("studentPanel.subject")}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">
                            {t("studentPanel.marks")}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">
                            {t("studentPanel.max")}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">
                            %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {result.subjects.map((subject, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                              {subject.name}
                            </td>
                            <td className={`px-4 py-3 text-sm text-center ${getStatusColor(subject.marks, subject.maxMarks)}`}>
                              {subject.marks}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">{subject.maxMarks}</td>
                            <td className={`px-4 py-3 text-sm text-center font-medium ${getStatusColor(subject.marks, subject.maxMarks)}`}>
                              {((subject.marks / subject.maxMarks) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-4 py-3">{t("studentPanel.total")}</td>
                          <td className="px-4 py-3 text-center">{result.totalMarks}</td>
                          <td className="px-4 py-3 text-center">{result.totalMaxMarks}</td>
                          <td className="px-4 py-3 text-center">
                            {Number(result.percentage).toFixed(1)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {result.remarks && (
                  <div className="bg-blue-50 rounded-lg p-4 text-gray-700">
                    <h4 className="font-semibold text-gray-800 mb-1">{t("studentPanel.remarks")}</h4>
                    <p>{result.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center animate-fadeIn">
              <div className="inline-block p-4 rounded-full bg-yellow-100 mb-4">
                <Search className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t("studentPanel.noResults")}
              </h3>
              <p className="text-gray-600">
                {t("studentPanel.noResultsDesc")}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentPanel;
