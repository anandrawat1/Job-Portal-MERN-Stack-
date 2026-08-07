import React from 'react'
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiCalendar, FiArrowRight } from 'react-icons/fi';

const Card = ({ data }) => {
  const { _id, companyName, jobTitle, companyLogo, minPrice, maxPrice, salaryType, jobLocation, employmentType, postingDate, description } = data;

  // Show "New" badge if posted within last 3 days
  const isNew = postingDate && (new Date() - new Date(postingDate)) / (1000 * 60 * 60 * 24) <= 3;

  const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const bgColors = ['#dbeafe', '#fce7f3', '#dcfce7', '#ede9fe', '#ffedd5'];
  const getBg = (name = '') => { let h = 0; for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h); return bgColors[Math.abs(h) % bgColors.length]; };

  return (
    <Link to={`/job/${_id}`} className="block group">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-200 hover:-translate-y-0.5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          {/* Company Logo / Initials */}
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"/>
            ) : (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-gray-700 flex-shrink-0 text-sm"
                   style={{ background: getBg(companyName) }}>
                {getInitials(companyName)}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{companyName}</p>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mt-0.5">{jobTitle}</h3>
            </div>
          </div>
          {data.status === 'closed' ? (
            <span className="flex-shrink-0 text-xs font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">Closed</span>
          ) : isNew ? (
            <span className="flex-shrink-0 text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">New</span>
          ) : null}
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">{description}</p>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg">
            <FiMapPin className="w-3 h-3"/> {jobLocation}
          </span>
          <span className="flex items-center gap-1.5 text-xs bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-lg">
            <FiClock className="w-3 h-3"/> {employmentType}
          </span>
          <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-lg font-medium">
            <FiDollarSign className="w-3 h-3"/> ₹{minPrice} – ₹{maxPrice} LPA
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <FiCalendar className="w-3 h-3"/> {postingDate}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
            View Details <FiArrowRight className="w-3 h-3"/>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Card;
