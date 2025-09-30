import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

const EditResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        studentName: "",
        grNumber: "",
        dateOfBirth: "",
        standard: "",
        subjects: [],
        remarks: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchResult = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/results/${id}`);
            if (!res.ok) throw new Error("Failed to fetch result");
            const data = await res.json();
            setFormData({
                studentName: data.studentName,
                grNumber: data.grNumber,
                dateOfBirth: data.dateOfBirth.split("T")[0],
                standard: data.standard,
                subjects: data.subjects.map((s) => ({
                    id: s._id,
                    name: s.name,
                    marks: s.marks,
                    maxMarks: s.maxMarks,
                })),
                remarks: data.remarks || "",
            });
        } catch (error) {
            toast.error(error.message || "Error fetching result");
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
        setFormData({
            ...formData,
            subjects: formData.subjects.filter((subject) => subject.id !== id),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch(`http://localhost:5000/api/results/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to update result");

            toast.success("Result updated successfully", { duration: 3000 });
            navigate("/admin/results");
        } catch (error) {
            toast.error(error.message || "Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-8 flax">
            <h1 className="text-3xl font-bold mb-4 flex items-center">
                <BookOpen className="mr-2 text-orange-600" /> Edit Result
            </h1>
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


            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
                {/* Student Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Student Name</label>
                        <input
                            type="text"
                            name="studentName"
                            value={formData.studentName}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">GR Number</label>
                        <input
                            type="text"
                            name="grNumber"
                            value={formData.grNumber}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>
                </div>

                {/* DOB & Standard */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Standard</label>
                        <input
                            type="text"
                            name="standard"
                            value={formData.standard}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>
                </div>

                {/* Subjects */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Subjects</label>
                        <button
                            type="button"
                            onClick={handleAddSubject}
                            className="text-blue-600 hover:underline"
                        >
                            <Plus className="inline-block mr-1" /> Add Subject
                        </button>
                    </div>

                    {formData.subjects.map((subject) => (
                        <div
                            key={subject.id}
                            className="grid grid-cols-12 gap-4 p-4 border rounded-md bg-gray-50 mb-2"
                        >
                            <div className="col-span-12 sm:col-span-4">
                                <label className="block text-xs text-gray-500">Subject Name</label>
                                <input
                                    type="text"
                                    value={subject.name}
                                    onChange={(e) =>
                                        handleSubjectChange(subject.id, "name", e.target.value)
                                    }
                                    className="w-full px-2 py-1 border rounded"
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-xs text-gray-500">Marks Obtained</label>
                                <input
                                    type="number"
                                    value={subject.marks}
                                    onChange={(e) =>
                                        handleSubjectChange(subject.id, "marks", e.target.value)
                                    }
                                    className="w-full px-2 py-1 border rounded"
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-xs text-gray-500">Maximum Marks</label>
                                <input
                                    type="number"
                                    value={subject.maxMarks}
                                    onChange={(e) =>
                                        handleSubjectChange(subject.id, "maxMarks", e.target.value)
                                    }
                                    className="w-full px-2 py-1 border rounded"
                                />
                            </div>

                            <div className="col-span-12 sm:col-span-2 flex items-end">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSubject(subject.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Remarks */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-md"
                        rows={3}
                    ></textarea>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/results")}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                        {isSubmitting ? "Saving..." : <><Save className="inline mr-1" /> Save</>}
                    </button>

                </div>
            </form>
        </div>
    );
};

export default EditResult;
