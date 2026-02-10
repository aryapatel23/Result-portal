import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { updateResult } from '../redux/slices/resultSlice';
import { Plus, Trash2, Save, BookOpen, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import axios from '../api/axios';

const TeacherEditResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        studentName: "",
        grNumber: "",
        dateOfBirth: "",
        standard: "",
        term: "",
        academicYear: "",
        subjects: [],
        remarks: "",
        uploadedBy: null,
        uploadedByRole: "",
    });
    const [uploaderInfo, setUploaderInfo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchResult = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/teacher/results/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = res.data;
            setFormData({
                studentName: data.studentName,
                grNumber: data.grNumber,
                dateOfBirth: data.dateOfBirth.split("T")[0],
                standard: data.standard,
                term: data.term || 'Term-1',
                academicYear: data.academicYear || '2024-25',
                subjects: data.subjects.map((s) => ({
                    id: s._id || crypto.randomUUID(),
                    name: s.name,
                    marks: s.marks,
                    maxMarks: s.maxMarks,
                })),
                remarks: data.remarks || "",
                uploadedBy: data.uploadedBy,
                uploadedByRole: data.uploadedByRole,
            });

            // Fetch uploader info if available
            if (data.uploadedBy) {
                try {
                    const uploaderRes = await axios.get(`/admin/teachers/${data.uploadedBy}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUploaderInfo(uploaderRes.data);
                } catch (err) {
                    console.log('Could not fetch uploader info');
                }
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching result:', error);
            toast.error(error.response?.data?.message || "Error fetching result");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResult();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
                { id: crypto.randomUUID(), name: "", marks: "", maxMarks: "100" },
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await dispatch(updateResult({ id, resultData: formData, role: 'teacher' })).unwrap();

            toast.success("Result updated successfully");
            navigate("/teacher/dashboard");
        } catch (error) {
            console.error('Error updating result:', error);
            toast.error(error || "Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading result...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/teacher/dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <BookOpen className="mr-3 text-indigo-600" /> Edit Result
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Update student result information
                            </p>
                        </div>
                    </div>
                </div>

                {/* Uploaded By Info Card */}
                {uploaderInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 rounded-full p-2 mr-3">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Uploaded By:</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {uploaderInfo.name}
                                    <span className="ml-2 text-sm text-gray-600">
                                        ({uploaderInfo.employeeId})
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    Role: {formData.uploadedByRole?.charAt(0).toUpperCase() + formData.uploadedByRole?.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                    {/* Student Info */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student Name *
                            </label>
                            <input
                                type="text"
                                name="studentName"
                                value={formData.studentName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                GR Number *
                            </label>
                            <input
                                type="text"
                                name="grNumber"
                                value={formData.grNumber}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                readOnly
                            />
                        </div>
                    </div>

                    {/* DOB & Standard */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth *
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Standard *
                            </label>
                            <select
                                name="standard"
                                value={formData.standard}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="">Select Standard</option>
                                <option value="Balvatika">Balvatika</option>
                                {[...Array(8)].map((_, i) => (
                                    <option key={i + 1} value={`${i + 1}`}>
                                        STD-{i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Term & Academic Year */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Term *
                            </label>
                            <select
                                name="term"
                                value={formData.term}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="Term-1">Term-1</option>
                                <option value="Term-2">Term-2</option>
                                <option value="Mid-term">Mid-term</option>
                                <option value="Final">Final</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Academic Year *
                            </label>
                            <input
                                type="text"
                                name="academicYear"
                                value={formData.academicYear}
                                onChange={handleChange}
                                placeholder="e.g., 2024-25"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Subjects */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Subjects *
                            </label>
                            <button
                                type="button"
                                onClick={handleAddSubject}
                                className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add Subject
                            </button>
                        </div>

                        {formData.subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-md bg-gray-50 mb-3"
                            >
                                <div className="col-span-12 sm:col-span-5">
                                    <label className="block text-xs text-gray-600 mb-1">Subject Name</label>
                                    <input
                                        type="text"
                                        value={subject.name}
                                        onChange={(e) =>
                                            handleSubjectChange(subject.id, "name", e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                <div className="col-span-5 sm:col-span-3">
                                    <label className="block text-xs text-gray-600 mb-1">Marks Obtained</label>
                                    <input
                                        type="number"
                                        value={subject.marks}
                                        onChange={(e) =>
                                            handleSubjectChange(subject.id, "marks", e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                <div className="col-span-5 sm:col-span-3">
                                    <label className="block text-xs text-gray-600 mb-1">Maximum Marks</label>
                                    <input
                                        type="number"
                                        value={subject.maxMarks}
                                        onChange={(e) =>
                                            handleSubjectChange(subject.id, "maxMarks", e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-1 flex items-end">
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

                    {/* Remarks */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Remarks (Optional)
                        </label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            rows={3}
                            placeholder="Any additional comments or feedback"
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/teacher/dashboard")}
                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherEditResult;
