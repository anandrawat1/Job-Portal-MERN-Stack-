import React, { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiArrowRight, FiBriefcase, FiUsers, FiTrendingUp } from 'react-icons/fi';

const jobCategories = ['Software Engineer', 'Product Designer', 'Data Scientist', 'DevOps Engineer', 'Frontend Developer', 'Product Manager'];

const Banner = ({ query, handleInputChange }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    const currentWord = jobCategories[activeCategory];
    let timer;
    if (!isDeleting && charIndex < currentWord.length) {
      timer = setTimeout(() => setCharIndex(c => c + 1), 80);
    } else if (!isDeleting && charIndex === currentWord.length) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => setCharIndex(c => c - 1), 45);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setActiveCategory(c => (c + 1) % jobCategories.length);
    }
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, activeCategory]);

  useEffect(() => {
    setDisplayed(jobCategories[activeCategory].slice(0, charIndex));
  }, [charIndex, activeCategory]);

  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 bg-blue-400 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-10 bg-indigo-300 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-5 bg-cyan-400 blur-2xl" />
      </div>

      <div className="max-w-screen-xl container mx-auto xl:px-24 px-6 py-20 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-gray-300 text-sm px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse text-gray-200"></span>
          10,000+ Active Jobs Available
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
          Find Your Dream Job<br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>
            As a&nbsp;
          </span>
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #60a5fa, #a78bfa)' }}>
            {displayed}
          </span>
          <span className="text-blue-400 animate-pulse">|</span>
        </h1>

        <p className="text-gray-200 text-lg mb-10 max-w-2xl leading-relaxed">
          Thousands of jobs in software, engineering, design, and technology are waiting for you. Start your journey today.
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="flex items-center gap-2 flex-1 px-3">
            <FiSearch className="text-gray-400 flex-shrink-0 w-5 h-5" />
            <input
              type="text"
              placeholder="Job title, skills, or keyword..."
              className="w-full py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm"
              onChange={handleInputChange}
              value={query}
            />
          </div>
          <div className="hidden sm:block w-px bg-gray-200 my-2" />
          <div className="flex items-center gap-2 px-3 sm:w-44">
            <FiMapPin className="text-gray-400 flex-shrink-0 w-5 h-5" />
            <input
              type="text"
              placeholder="Location"
              className="w-full py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm"
            />
          </div>
          <button type="submit"
            className="flex items-center justify-center gap-2 bg-[#3575E2] hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md whitespace-nowrap text-sm">
            Search Jobs <FiArrowRight />
          </button>
        </div>

        {/* Popular Searches */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-gray-300 text-sm">Popular:</span>
          {['React Developer', 'UI/UX Designer', 'Python', 'Full Stack', 'Remote'].map(tag => (
            <button key={tag}
              onClick={() => {
                handleInputChange({ target: { value: tag } });
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-screen-xl container mx-auto xl:px-24 px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center">
                <FiBriefcase className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-base font-bold">10,000+</p>
                <p className="text-xs text-blue-300">Active Jobs</p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-white/20" />
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-purple-500/30 rounded-xl flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <p className="text-base font-bold">50,000+</p>
                <p className="text-xs text-blue-300">Candidates</p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-white/20" />
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-green-500/30 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <p className="text-base font-bold">500+</p>
                <p className="text-xs text-blue-300">Companies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;