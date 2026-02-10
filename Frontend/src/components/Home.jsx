import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, User, ArrowRight, Search, GraduationCap, Users, BookOpen, Award, ChevronLeft, ChevronRight, Star, FileText, Clock } from 'lucide-react';
import { activities } from "../data/activitiesData";

const Home = () => {
  const [grNo, setGrNo] = useState('');
  const [dob, setDob] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const images = [
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104769/IMG-20250813-WA0022_fptvhx.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104769/IMG-20250813-WA0025_yhxp16.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0023_h8bxl9.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0026_rcb7z9.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104769/IMG-20250813-WA0027_bimwnh.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0020_tpkaaf.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0019_tplkp7.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0024_tjtb7t.jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (grNo && dob) {
      setIsLoading(true);
      try {
        navigate(`/student/view?grNo=${grNo}&dob=${dob}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section with Enhanced Carousel */}
        <div className="relative w-full h-96 md:h-[500px] overflow-hidden shadow-2xl rounded-2xl border border-gray-200">
          <div className="relative w-full h-full">
            {images.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`School ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                  index === currentIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'
                }`}
                loading="lazy"
              />
            ))}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 z-20" />



            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-opacity-30 transition-all duration-300 z-40 group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-full text-white hover:bg-opacity-30 transition-all duration-300 z-40 group"
            >
              <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-40">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === index 
                      ? 'bg-white w-8' 
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        

        {/* Portal Cards */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Student Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access your academic information and student dashboard
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-4xl mx-auto">
            {/* Quick Result Access */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group border border-gray-100 hover:border-emerald-200 hover:scale-105">
              <Link to="/student/view" className="block">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-emerald-50 group-hover:bg-emerald-100 p-6 rounded-2xl mb-6 transition-all duration-300">
                    <FileText className="h-12 w-12 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Quick Result Check</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    View your latest results instantly with GR number and date of birth
                  </p>
                  <span className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-2 transition-all duration-300">
                    Check Now <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Student Portal */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group border border-gray-100 hover:border-green-200 hover:scale-105">
              <Link to="/student/login" className="block">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-green-50 group-hover:bg-green-100 p-6 rounded-2xl mb-6 transition-all duration-300">
                    <User className="h-12 w-12 text-green-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Student Portal</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Complete dashboard with results, attendance, and performance analytics
                  </p>
                  <span className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-all duration-300">
                    Login <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-800 mb-2">Academic Excellence</h4>
            <p className="text-gray-600 text-sm">Quality education with comprehensive curriculum</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-800 mb-2">Expert Faculty</h4>
            <p className="text-gray-600 text-sm">Experienced and dedicated teaching staff</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <Award className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-800 mb-2">Achievement Track</h4>
            <p className="text-gray-600 text-sm">Proven track record of student success</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-800 mb-2">Digital Learning</h4>
            <p className="text-gray-600 text-sm">Modern technology-enabled education</p>
          </div>
        </div>

        {/* Activities Section */}
        {activities && activities.length > 0 && (
          <section className="mt-20">
            <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">School Activities</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {activities.slice(0, 3).map((activity, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <img 
                    src={activity.images && activity.images.length > 0 ? activity.images[0] : 'https://via.placeholder.com/600x400?text=Activity'}
                    alt={activity.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{activity.title}</h3>
                    <p className="text-slate-600 text-sm mb-3">{activity.date}</p>
                    <p className="text-gray-600 leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/activities"
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 rounded-xl transition-all duration-300 font-semibold"
              >
                See All Activities
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        )}

        {/* About Section */}
        <section className="mt-20 bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">About the Portal</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our Student Result Portal is designed to streamline the process of managing and accessing academic results.
                Teachers can easily upload student performance data, while students and parents can securely view results using GR number and date of birth.
              </p>
              <p className="text-gray-600 leading-relaxed">
                The system ensures privacy, security, and quick access to academic performance with real-time updates and comprehensive analytics.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600">500+</div>
                <div className="text-sm text-emerald-700">Active Students</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-600">25+</div>
                <div className="text-sm text-slate-700">Expert Teachers</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">98%</div>
                <div className="text-sm text-purple-700">Success Rate</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <div className="text-2xl font-bold text-amber-600">15+</div>
                <div className="text-sm text-amber-700">Years Experience</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;