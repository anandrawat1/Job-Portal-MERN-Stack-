import { useEffect, useState } from "react";
import Banner from "../../components/Banner"
import Card from "../../components/Card";
import Jobs from "./Jobs";
import Sidebar from "../../sidebar/Sidebar";
import Newsletter from "../../components/Newsletter";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const[currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_BASE_URL}/all-jobs`)
      .then((res) => res.json())
      .then((data) => {
        const jobsArray = Array.isArray(data) ? data : [];
        setJobs(jobsArray);
        setIsLoading(false);
      })
      .catch(() => {
        fetch('/jobs.json')
          .then((res) => res.json())
          .then((fallbackData) => {
            setJobs(Array.isArray(fallbackData) ? fallbackData : []);
            setIsLoading(false);
          })
          .catch(() => {
            setJobs([]);
            setIsLoading(false);
          });
      });
  }, [])

  // console.log(jobs)

  const [query, setQuery] = useState("");
  const handleInputChange = (event) => {
    setQuery(event.target.value)
  }

  // FILTER JOBS BY TITLE
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const filteredItems = safeJobs.filter((job) => {
    const title = job?.jobTitle || "";
    return title.toLowerCase().indexOf(query.toLowerCase()) !== -1;
  });
  // console.log(filteredItems)

  // Radio Filtering

  const handleChange = (event) => {
    setSelectedCategory(event.target.value)
  }

  // Button based Filtering
  const handleClick = (event) => {
    setSelectedCategory(event.target.value)
  }

  //Calculate the index range
  const calculatePageRange = () => {
    const startIndex = (currentPage -1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {startIndex, endIndex};
  }

  // Function for the next page
const nextPage = () => {
  if (currentPage < Math.ceil(filteredItems.length / itemsPerPage)){
    setCurrentPage(currentPage + 1);
  }
}

// Function for the previous page

const prevPage = () => {
  if(currentPage > 1){
    setCurrentPage(currentPage - 1)
  }
}


  //Main Function
  const filteredData = (jobs, selected, query) => {
    let filteredJobs = Array.isArray(jobs) ? jobs : [];

    //Filtering Input Items
    if(query){
      filteredJobs = filteredItems;
    }

    //Category Filtering

    if(selected) {
      filteredJobs = filteredJobs.filter(({jobLocation, maxPrice, experienceLevel, salaryType, employmentType, postingDate,

      }) => {
        const location = (jobLocation || "").toLowerCase();
        const salaryTypeValue = (salaryType || "").toLowerCase();
        const experienceValue = (experienceLevel || "").toLowerCase();
        const employmentValue = (employmentType || "").toLowerCase();

        return location === selected.toLowerCase() ||
          parseInt(maxPrice || 0) <= parseInt(selected) ||
          (postingDate || "") >= selected ||
          salaryTypeValue === selected.toLowerCase() ||
          experienceValue === selected.toLowerCase() ||
          employmentValue === selected.toLowerCase();
      });
      console.log(filteredJobs);
    }

    // Slice the data based on current page
    const {startIndex, endIndex} = calculatePageRange();
    filteredJobs = filteredJobs.slice(startIndex, endIndex)

    return filteredJobs.map((data, i) => <Card key ={i} data={data}/>)
  }

  const result = filteredData(jobs, selectedCategory, query);

  return (
    <div>
      <Banner query={query} handleInputChange={handleInputChange} />
    
    {/* Main Content */}
    <div className="bg-[#f8fafc] lg:grid grid-cols-4 gap-8 xl:px-24 px-4 py-12">
      {/* Left Side – Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 self-start lg:sticky lg:top-4 mb-6 lg:mb-0">
        <Sidebar handleChange={handleChange} handleClick={handleClick}/>
      </div>

      {/* Jobs Grid */}
      <div className="col-span-2">
        {/* Count */}
        {!isLoading && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-gray-700">
              Showing <span className="text-blue">{result.length}</span> of <span className="text-blue">{filteredItems.length}</span> jobs
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl"/>
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-gray-100 rounded w-1/3"/>
                    <div className="h-4 bg-gray-100 rounded w-2/3"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full"/>
                  <div className="h-3 bg-gray-100 rounded w-5/6"/>
                </div>
              </div>
            ))}
          </div>
        ) : result.length > 0 ? (
          <Jobs result={result}/>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700">No jobs found</p>
            <p className="text-sm text-gray-400 mt-1">Try different keywords or clear your filters</p>
          </div>
        )}

        {/* Pagination */}
        {result.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={prevPage} disabled={currentPage === 1}
              className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors">
              ← Previous
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
            </span>
            <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}
              className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Right Side – Sidebar widgets */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 self-start mt-6 lg:mt-0">
        <Newsletter/>
      </div>
    </div>
    
    </div>
  )
}

export default Home
