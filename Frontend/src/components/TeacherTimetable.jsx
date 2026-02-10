import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Clock, Plus, Trash2, Save } from 'lucide-react';

const TeacherTimetable = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [timetable, setTimetable] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });
  const [academicYear, setAcademicYear] = useState('2024-25');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchTeacherData();
    fetchTimetable();
  }, [teacherId]);

  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/admin/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeacher(response.data.teacher);
    } catch (error) {
      console.error('Error fetching teacher:', error);
      toast.error('Failed to load teacher data');
    }
  };

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/timetable/admin/timetable/${teacherId}?academicYear=${academicYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.timetable && response.data.timetable.schedule) {
        setTimetable(response.data.timetable.schedule);
      }
      if (response.data.teacher) {
        setTeacher(response.data.teacher);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const addPeriod = (day) => {
    setTimetable({
      ...timetable,
      [day]: [
        ...timetable[day],
        {
          timeSlot: '',
          startTime: '',
          endTime: '',
          subject: '',
          class: '',
          room: '',
        },
      ],
    });
  };

  const removePeriod = (day, index) => {
    setTimetable({
      ...timetable,
      [day]: timetable[day].filter((_, i) => i !== index),
    });
  };

  const updatePeriod = (day, index, field, value) => {
    const updatedDay = [...timetable[day]];
    updatedDay[index][field] = value;

    // Auto-update timeSlot when startTime or endTime changes
    if (field === 'startTime' || field === 'endTime') {
      const startTime = field === 'startTime' ? value : updatedDay[index].startTime;
      const endTime = field === 'endTime' ? value : updatedDay[index].endTime;
      if (startTime && endTime) {
        updatedDay[index].timeSlot = `${startTime} - ${endTime}`;
      }
    }

    setTimetable({
      ...timetable,
      [day]: updatedDay,
    });
  };

  const saveTimetable = async () => {
    // Validate timetable before saving
    let isValid = true;
    days.forEach((day) => {
      timetable[day]?.forEach((period) => {
        if (!period.startTime || !period.endTime || !period.subject || !period.class) {
          isValid = false;
        }
      });
    });

    if (!isValid) {
      toast.error('Please fill in all required fields (Time, Subject, Class) for all periods.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/timetable/admin/timetable/${teacherId}`,
        {
          schedule: timetable,
          academicYear: academicYear,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Timetable saved successfully!');
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast.error(error.response?.data?.message || 'Failed to save timetable');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(`/admin/teacher/${teacherId}`)}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teacher Details
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 rounded-full p-3">
                <Calendar className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {teacher?.name}'s Timetable
                </h1>
                <p className="text-gray-600">Employee ID: {teacher?.employeeId}</p>
              </div>
            </div>
            <button
              onClick={saveTimetable}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Timetable'}
            </button>
          </div>
        </div>

        {/* Timetable */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Schedule
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {day}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        {timetable[day].length > 0 ? (
                          timetable[day].map((period, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="time"
                                  value={period.startTime || ''}
                                  onChange={(e) => updatePeriod(day, index, 'startTime', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md text-sm w-28"
                                  placeholder="Start"
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                  type="time"
                                  value={period.endTime || ''}
                                  onChange={(e) => updatePeriod(day, index, 'endTime', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-md text-sm w-28"
                                  placeholder="End"
                                />
                              </div>
                              <select
                                value={period.subject}
                                onChange={(e) => updatePeriod(day, index, 'subject', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm flex-1"
                              >
                                <option value="">Select Subject</option>
                                {teacher?.subjects?.map((subject) => (
                                  <option key={subject} value={subject}>
                                    {subject}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={period.class}
                                onChange={(e) => updatePeriod(day, index, 'class', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                              >
                                <option value="">Select Class</option>
                                {teacher?.assignedClasses?.map((cls) => (
                                  <option key={cls} value={cls}>
                                    {cls}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={period.room || ''}
                                onChange={(e) => updatePeriod(day, index, 'room', e.target.value)}
                                placeholder="Room"
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-20"
                              />
                              <button
                                onClick={() => removePeriod(day, index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No periods scheduled</p>
                        )}
                        <button
                          onClick={() => addPeriod(day)}
                          className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Period
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800">
            <strong>✅ Manual Time Setting:</strong> You can now set custom start and end times for each lecture.
            Different lectures can have different durations based on your needs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherTimetable;
