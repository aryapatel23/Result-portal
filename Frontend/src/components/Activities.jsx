// src/pages/Activities.jsx
import React from "react";
import { activities } from "../data/activitiesData";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Activities = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
        School Activities
      </h1>

      <div className="space-y-16">
        {activities.map((activity, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row items-center gap-8 ${
              index % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Image Slider */}
            <div className="md:w-1/2">
              <Slider {...sliderSettings}>
                {activity.images.map((img, imgIndex) => (
                  <div key={imgIndex}>
                    <img
                      src={img}
                      alt={`${activity.title} ${imgIndex + 1}`}
                      className="w-full h-102 px-9 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                ))}
              </Slider>
            </div>

            {/* Text */}
            <div className="md:w-1/2">
              <h2 className="text-2xl font-semibold text-gray-800">
                {activity.title}
              </h2>
              <p className="text-gray-600 mt-3">{activity.description}</p>
              <p className="text-gray-400 text-sm mt-2">
                Date: {activity.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Activities;
