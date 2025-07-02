import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, User, ArrowRight } from 'lucide-react';

const Home = () => {
  const [grNo, setGrNo] = useState('');
  const [dob, setDob] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (grNo && dob) {
      navigate(`/student/view?grNo=${grNo}&dob=${dob}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      {/* Header + Search Form */}
      <section className="text-center mb-10 pt-10">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">
          Welcome to the Student Result Portal
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Enter your GR Number and Date of Birth to view your academic result.
        </p>
      </section>

      {/* Portal Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Teacher Portal */}
        <Link
          to="/admin/login"
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 group"
        >
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition">
              <UserCheck className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Teacher Portal</h2>
            <p className="text-gray-600 text-center mb-4">
              Upload and manage student results with an easy-to-use interface.
            </p>
            <span className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
              Enter Portal <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>

        {/* Student Portal */}
        <Link
          to={grNo && dob ? `/student/view?grNo=${grNo}&dob=${dob}` : '/student/view'}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 group"
        >
          <div className="flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition">
              <User className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Student Portal</h2>
            <p className="text-gray-600 text-center mb-4">
              View your academic results by entering your GR No and Date of Birth.
            </p>
            <span className="flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform">
              Enter Portal <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>
      </div>

      {/* About Section */}
      <section className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">About the Portal</h2>
        <p className="text-gray-600 mb-4">
          Our Student Result Portal is designed to streamline the process of managing and accessing academic results.
          Teachers can easily upload student performance data, while students and parents can securely view results using GR number and date of birth.
        </p>
        <p className="text-gray-600">
          The system ensures privacy, simplicity, and quick access to academic performance.
        </p>
      </section>
    </div>
  );
};

export default Home;
