import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-screen-xl mx-auto px-6 xl:px-24 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <svg width="24" height="24" viewBox="0 0 29 30" xmlns="http://www.w3.org/2000/svg" fill="none">
                <circle cx="12.0143" cy="12.5143" r="12.0143" fill="#3575E2" fillOpacity="0.4"/>
                <circle cx="16.9857" cy="17.4857" r="12.0143" fill="#3575E2"/>
              </svg>
              <span className="font-bold text-gray-900">JobJunction</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connecting top talent with leading companies across the globe.
            </p>
          </div>

          {/* For Job Seekers */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3">Job Seekers</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Find Jobs</Link></li>
              <li><Link to="/salary" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Salary Insights</Link></li>
              <li><Link to="/my-job" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">My Applications</Link></li>
              <li><Link to="/profile" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Edit Profile</Link></li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3">Employers</h4>
            <ul className="space-y-2">
              <li><Link to="/post-job" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Post a Job</Link></li>
              <li><Link to="/companies" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Browse Companies</Link></li>
              <li><Link to="/my-job" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Manage Jobs</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 mb-3">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Login</Link></li>
              <li><Link to="/sign-up" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Sign up</Link></li>
              <li><Link to="/forgot-password" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Forgot Password</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© 2026 JobJunction. Made by <a href="https://www.linkedin.com/in/lakshay-dhoundiyal-531b25259/" target="_blank" rel="noopener noreferrer" className="text-blue font-medium hover:underline">Lakshay Dhoundiyal</a>.</p>
          <p className="text-xs text-gray-400">Built with React, Node.js & MongoDB</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
