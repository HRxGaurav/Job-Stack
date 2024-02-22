import React,{useEffect, useState} from 'react'
import Navbar from '../Components/Navbar';
import jobData from '../Components/jobdata';
import JobCards from '../Components/JobCards';

const Homepage = () => {

  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/jobs`);
        const data = await response.json();
        if (response.ok) {
          setJobs(data.jobs);
          console.log(data.jobs);
        } else {
          console.error('Failed to fetch jobs:', data.message);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);


  return (
    <>
      <Navbar />
      {jobs.map((val) => {
        return (
          <JobCards
            key={val._id}
            job_position={val.role}
            logo_url={val.company.companyLogo}
            min_ctc={val.minCTC}
            max_ctc={val.maxCTC}
            email={val.company.username}
            companyName={val.company.companyName}
            experienceRequired={val.location}
            requiredRupees ={val.requiredRupees}
            id={val._id}
          />
        );
      })}
    </>
  )
}

export default Homepage