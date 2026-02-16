import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  X,
  Settings,
  Clock,
  Bell,
  Calendar,
  Save,
  RefreshCw,
  AlertCircle,
  Play,
  Info,
  SunDim,
  Check
} from 'lucide-react';

const AttendanceSettingsModal = ({ isOpen, onClose }) => {
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingAutoMark, setTestingAutoMark] = useState(false);
  
  const [settings, setSettings] = useState({
    enabled: true,
    deadlineTime: '18:00',
    halfDayThreshold: '12:00',
    enableHalfDay: true,
    autoMarkAsLeave: true,
    excludeWeekends: true,
    notifyTeachers: true
  });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/system-config/teacher-attendance-settings',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching attendance settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/system-config/teacher-attendance-settings',
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Attendance automation settings saved successfully!');
      setSavingSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
      setSavingSettings(false);
    }
  };

  const handleTestAutoMark = async () => {
    try {
      setTestingAutoMark(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/system-config/test-teacher-attendance',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = response.data.result;
      toast.success(
        `Test completed! Marked: ${result.markedCount || 0}, Already marked: ${result.alreadyMarkedCount || 0}`,
        { duration: 5000 }
      );
      setTestingAutoMark(false);
    } catch (error) {
      console.error('Error testing:', error);
      toast.error('Test failed');
      setTestingAutoMark(false);
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-300">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 relative">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Settings className="w-7 h-7 text-gray-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Attendance Automation Settings</h2>
              <p className="text-gray-600 text-sm mt-1">Configure automatic teacher attendance marking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Info Banner */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2 text-gray-900">How Automation Works:</p>
                <ul className="space-y-1 ml-4 list-disc text-gray-600">
                  <li>System runs daily at <strong className="text-gray-900">6:05 PM IST</strong> automatically</li>
                  <li>Teachers who haven't marked attendance will be marked as <strong className="text-gray-900">"Leave"</strong></li>
                  <li>Automatically respects Sundays and public holidays</li>
                  <li>Optional: Enable half-day marking for late submissions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Enable/Disable Automation */}
            <div className="p-5 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${settings.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {settings.enabled ? (
                      <Check className="w-6 h-6 text-green-700" />
                    ) : (
                      <Settings className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Enable Automation</h4>
                    <p className="text-xs text-gray-500">Auto-mark teacher attendance</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('enabled')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                    settings.enabled
                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {settings.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Deadline Time */}
            <div className="p-5 bg-white rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Deadline Time</h4>
                  <p className="text-xs text-gray-500">Mark by this time</p>
                </div>
              </div>
              <input
                type="time"
                value={settings.deadlineTime}
                onChange={(e) => setSettings(prev => ({ ...prev, deadlineTime: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-semibold text-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
              />
            </div>

            {/* Auto Mark as Leave */}
            <div className="p-5 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${settings.autoMarkAsLeave ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <AlertCircle className={`w-6 h-6 ${settings.autoMarkAsLeave ? 'text-red-700' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Auto-Mark Leave</h4>
                    <p className="text-xs text-gray-500">Mark absent as "Leave"</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('autoMarkAsLeave')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                    settings.autoMarkAsLeave
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {settings.autoMarkAsLeave ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Half-Day Feature */}
            <div className="p-5 bg-white rounded-lg border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${settings.enableHalfDay ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <SunDim className={`w-6 h-6 ${settings.enableHalfDay ? 'text-orange-700' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Half-Day Marking</h4>
                    <p className="text-xs text-gray-500">Late = half-day</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('enableHalfDay')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                    settings.enableHalfDay
                      ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {settings.enableHalfDay ? 'ON' : 'OFF'}
                </button>
              </div>
              {settings.enableHalfDay && (
                <input
                  type="time"
                  value={settings.halfDayThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, halfDayThreshold: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-semibold text-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all"
                />
              )}
            </div>

            {/* Exclude Sundays */}
            <div className="p-5 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${settings.excludeWeekends ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Calendar className={`w-6 h-6 ${settings.excludeWeekends ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Exclude Sundays</h4>
                    <p className="text-xs text-gray-500">Skip Sunday auto-mark</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('excludeWeekends')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                    settings.excludeWeekends
                      ? 'bg-gray-700 text-white border-gray-700 hover:bg-gray-800'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {settings.excludeWeekends ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="p-5 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${settings.notifyTeachers ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Bell className={`w-6 h-6 ${settings.notifyTeachers ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                    <p className="text-xs text-gray-500">Notify absent teachers</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('notifyTeachers')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                    settings.notifyTeachers
                      ? 'bg-gray-700 text-white border-gray-700 hover:bg-gray-800'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {settings.notifyTeachers ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-all font-semibold disabled:opacity-50"
            >
              {savingSettings ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
            
            <button
              onClick={handleTestAutoMark}
              disabled={testingAutoMark}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold disabled:opacity-50"
            >
              {testingAutoMark ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Test Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSettingsModal;
