// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { UserCheck, User, ArrowRight } from 'lucide-react';
// import { activities } from "../data/activitiesData";

// const Home = () => {
//   const [grNo, setGrNo] = useState('');
//   const [dob, setDob] = useState('');
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const navigate = useNavigate();

//   const images = [
//     "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104769/IMG-20250813-WA0022_fptvhx.jpg",
//     "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104769/IMG-20250813-WA0025_yhxp16.jpg",
//     "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0023_h8bxl9.jpg",
//     "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0026_rcb7z9.jpg",
//     "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104769/IMG-20250813-WA0027_bimwnh.jpg",
//     "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0020_tpkaaf.jpg",
//     "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0019_tplkp7.jpg",
//     "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0024_tjtb7t.jpg",
//   ];

//   // Auto-slide every 4s
//   // useEffect(() => {
//   //   const timer = setInterval(() => {
//   //     setCurrentIndex((prev) => (prev + 1) % images.length);
//   //   }, 4000);
//   //   return () => clearInterval(timer);
//   // }, []);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % images.length);
//     }, 4000);
//     return () => clearInterval(timer);
//   }, []);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     if (grNo && dob) {
//       navigate(`/student/view?grNo=${grNo}&dob=${dob}`);
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto px-4 pb-12">
//       {/* Full-Width Carousel without Zoom Effect */}
//       <div className="relative w-full h-80 md:h-[400px] overflow-hidden shadow-lg rounded-lg ">
//         {images.map((src, index) => (
//           <img
//             key={index}
//             src={src}
//             alt={`School ${index + 1}`}
//             className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
//               }`}
//             loading="lazy"
//           />
//         ))}

//         {/* Dark Overlay */}
//         <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white px-4 z-20">
//           <h1 className="text-4xl md:text-5xl font-bold mb-2">KAMLI ANUPAM PRIMARY SCHOO</h1>
//           <p className="text-lg md:text-2xl">Shaping Future, Nurturing Excellence</p>
//         </div>

//         {/* Left Arrow */}
//         <button
//           onClick={() =>
//             setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
//           }
//           className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition z-30"
//         >
//           ❮
//         </button>

//         {/* Right Arrow */}
//         <button
//           onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
//           className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition z-30"
//         >
//           ❯
//         </button>

//         {/* Dots Navigation */}
//         <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
//           {images.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentIndex(index)}
//               className={`w-4 h-4 rounded-full transition-colors ${currentIndex === index ? 'bg-white' : 'bg-gray-400'
//                 }`}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Header */}
//       <section className="text-center mb-10 pt-10">
//         <h2 className="text-4xl font-bold text-indigo-700 mb-4">
//           Welcome to the Student Result Portal
//         </h2>
//         <p className="text-lg text-gray-600 mb-6">
//           Enter your GR Number and Date of Birth to view your academic result.
//         </p>
//       </section>

//       {/* Portal Cards */}
//       <div className="grid md:grid-cols-2 gap-8 mb-16">
//         {/* Student Portal */}
//         <Link
//           to={grNo && dob ? `/student/view?grNo=${grNo}&dob=${dob}` : '/student/view'}
//           className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 group"
//         >
//           <div className="flex flex-col items-center">
//             <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition">
//               <User className="h-10 w-10 text-green-600" />
//             </div>
//             <h2 className="text-2xl font-semibold text-gray-800 mb-2">Student Portal</h2>
//             <p className="text-gray-600 text-center mb-4">
//               View your academic results by entering your GR No and Date of Birth.
//             </p>
//             <span className="flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform">
//               Enter Portal <ArrowRight className="ml-1 h-4 w-4" />
//             </span>
//           </div>
//         </Link>

//         {/* Teacher Portal */}
//         <Link
//           to="/admin/login"
//           className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 group"
//         >
//           <div className="flex flex-col items-center">
//             <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition">
//               <UserCheck className="h-10 w-10 text-blue-600" />
//             </div>
//             <h2 className="text-2xl font-semibold text-gray-800 mb-2">Teacher Portal</h2>
//             <p className="text-gray-600 text-center mb-4">
//               Upload and manage student results with an easy-to-use interface.
//             </p>
//             <span className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
//               Enter Portal <ArrowRight className="ml-1 h-4 w-4" />
//             </span>
//           </div>
//         </Link>
//       </div>

//       {/* Activities Preview Section */}
//       <section className="mt-16">
//         <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">School Activities</h2>

//         <div className="grid md:grid-cols-3 gap-6">
//           {activities.slice(0, 3).map((act, index) => (
//             <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
//               <img src={act.img} alt={act.title} className="w-full h-70 object-cover" />
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold text-indigo-700">{act.title}</h3>
//                 <p className="text-gray-500 text-sm">{act.date}</p>
//                 <p className="text-gray-600 mt-2 line-clamp-2">{act.descript}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="text-center mt-6">
//           <Link
//             to="/activities"
//             className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
//           >
//             See All Activities
//           </Link>
//         </div>
//       </section>

//       {/* About Section */}
//       <section className="bg-white rounded-lg shadow p-8">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-4">About the Portal</h2>
//         <p className="text-gray-600 mb-4">
//           Our Student Result Portal is designed to streamline the process of managing and accessing academic results.
//           Teachers can easily upload student performance data, while students and parents can securely view results using GR number and date of birth.
//         </p>
//         <p className="text-gray-600">
//           The system ensures privacy, simplicity, and quick access to academic performance.
//         </p>
//       </section>
//     </div>
//   );
// };

// export default Home;




import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCheck, User, ArrowRight } from "lucide-react";
import { activities } from "../data/activitiesData";
import { useTranslation } from "react-i18next";

const Home = () => {
  const [grNo, setGrNo] = useState("");
  const [dob, setDob] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const images = [
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104769/IMG-20250813-WA0022_fptvhx.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104769/IMG-20250813-WA0025_yhxp16.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0023_h8bxl9.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0026_rcb7z9.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104769/IMG-20250813-WA0027_bimwnh.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0020_tpkaaf.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0019_tplkp7.jpg",
    "https://res.cloudinary.com/dzsvjyg2c/image/upload/v1755104768/IMG-20250813-WA0024_tjtb7t.jpg",
  ];

  // Auto-slide every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (grNo && dob) {
      navigate(`/student/view?grNo=${grNo}&dob=${dob}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      {/* Carousel */}
      <div className="relative w-full h-80 md:h-[400px] overflow-hidden shadow-lg rounded-lg">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`School ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            loading="lazy"
          />
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white px-4 z-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {t("schoolName")}
          </h1>
          <p className="text-lg md:text-2xl">{t("schoolTagline")}</p>
        </div>

        {/* Left Arrow */}
        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
          }
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition z-30"
        >
          ❮
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition z-30"
        >
          ❯
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-4 h-4 rounded-full transition-colors ${
                currentIndex === index ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <section className="text-center mb-10 pt-10">
        <h2 className="text-4xl font-bold text-indigo-700 mb-4">
          {t("welcomeTitle")}
        </h2>
        <p className="text-lg text-gray-600 mb-6">{t("welcomeDesc")}</p>
      </section>

      {/* Portal Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* Student Portal */}
        <Link
          to={
            grNo && dob ? `/student/view?grNo=${grNo}&dob=${dob}` : "/student/view"
          }
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 group"
        >
          <div className="flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:bg-green-200 transition">
              <User className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {t("studentPortal")}
            </h2>
            <p className="text-gray-600 text-center mb-4">
              {t("studentPortalDesc")}
            </p>
            <span className="flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform">
              {t("enterPortal")} <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>

        {/* Teacher Portal */}
        <Link
          to="/admin/login"
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-8 group"
        >
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4 group-hover:bg-blue-200 transition">
              <UserCheck className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {t("teacherPortal")}
            </h2>
            <p className="text-gray-600 text-center mb-4">
              {t("teacherPortalDesc")}
            </p>
            <span className="flex items-center text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
              {t("enterPortal")} <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </div>
        </Link>
      </div>

      {/* Activities */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {t("schoolActivities")}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {activities.slice(0, 3).map((act, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={act.img}
                alt={act.title}
                className="w-full h-70 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-indigo-700">
                  {act.title}
                </h3>
                <p className="text-gray-500 text-sm">{act.date}</p>
                <p className="text-gray-600 mt-2 line-clamp-2">{act.descript}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link
            to="/activities"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
          >
            {t("seeAllActivities")}
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {t("aboutTitle")}
        </h2>
        <p className="text-gray-600 mb-4">{t("aboutDesc1")}</p>
        <p className="text-gray-600">{t("aboutDesc2")}</p>
      </section>
    </div>
  );
};

export default Home;
