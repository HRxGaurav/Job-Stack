import React, { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const JobPost = () => {
  const [role, setRole] = useState('');
  const [minCTC, setMinCTC] = useState('');
  const [maxCTC, setMaxCTC] = useState('');
  const [location, setLocation] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobDetails = {
      role,
      minCTC,
      maxCTC,
      location
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/post-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${Cookies.get('token')}`
        },
        body: JSON.stringify(jobDetails)
      });

      if (response.ok) {
        toast.success('Job posted successfully')
        console.log('Job posted successfully');
        navigate('/')

      } else {
        console.error('Failed to post job:', response.status);
      }
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  return (
    <>
    
    <br/>
    <br/>
    <br/>
    <div className="job-post-container">
    
      <h2>Post a Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <input type="text" id="role" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="minCTC">Minimum CTC:</label>
          <input type="text" id="minCTC" value={minCTC} onChange={(e) => setMinCTC(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="maxCTC">Maximum CTC:</label>
          <input type="text" id="maxCTC" value={maxCTC} onChange={(e) => setMaxCTC(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <button type="submit">Post Job</button>
      </form>
    </div>
    </>
  );
}

export default JobPost;
