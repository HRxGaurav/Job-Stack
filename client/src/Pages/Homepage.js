import React,{useEffect, useState, useContext} from 'react'
import Navbar from '../Components/Navbar';
import jobData from '../Components/jobdata';
import JobCards from '../Components/JobCards';
import LogContext from '../Utilities/LogContext';
import '../App.css'

const Homepage = () => {

  const [jobs, setJobs] = useState([]);
  const [logged, setLogged] = useContext(LogContext);

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


      { logged && jobs.map((val) => {
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



      {!logged && <div className='loginfirst'>Log In First</div>}
    </>
  )
}

export default Homepage