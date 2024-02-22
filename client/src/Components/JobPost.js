import React, { useState } from 'react';
import Cookies from 'js-cookie';

const JobPost = () => {
  const [role, setRole] = useState('');
  const [minCTC, setMinCTC] = useState('');
  const [maxCTC, setMaxCTC] = useState('');
  const [location, setLocation] = useState('');

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
        console.log('Job posted successfully');
        // Handle success, such as redirecting the user or showing a success message
      } else {
        console.error('Failed to post job:', response.status);
        // Handle other response statuses, such as showing an error message to the user
      }
    } catch (error) {
      console.error('Error posting job:', error);
      // Handle error, such as showing an error message to the user
    }
  };

  return (
    <div>
      <h2>Post a Job</h2>
      <label htmlFor="role">Role:</label>
      <input type="text" id="role" value={role} onChange={(e) => setRole(e.target.value)} />
      <br />
      <label htmlFor="minCTC">Minimum CTC:</label>
      <input type="text" id="minCTC" value={minCTC} onChange={(e) => setMinCTC(e.target.value)} />
      <br />
      <label htmlFor="maxCTC">Maximum CTC:</label>
      <input type="text" id="maxCTC" value={maxCTC} onChange={(e) => setMaxCTC(e.target.value)} />
      <br />
      <label htmlFor="location">Location:</label>
      <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <br />
      <button onClick={handleSubmit}>Post Job</button>
    </div>
  );
}

export default JobPost;
