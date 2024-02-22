import React, { useState } from 'react';
import Cookies from 'js-cookie';

const AddCompanyDetails = () => {
  const [companyName, setCompanyName] = useState('');
  const [logoLink, setLogoLink] = useState('');

  const handleSubmit = async () => {
    const requestData = { companyName, logoLink };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/company/add-details`, {
        method: 'POST',
        headers: {
          'Authorization': `${Cookies.get('token')}`,
          'Content-Type': 'application/json' // Specify JSON content type
        },
        body: JSON.stringify(requestData) // Convert body to JSON
      });

      if (response.ok) {
        console.log('Company details added successfully');
        // Handle success, such as redirecting the user or showing a success message
      } else {
        console.error('Failed to add company details:', response.status);
        // Handle other response statuses, such as showing an error message to the user
      }
    } catch (error) {
      console.error('Error adding company details:', error);
      // Handle error, such as showing an error message to the user
    }
  };

  return (
    <div>
      <h2>Add Company Details</h2>
      <label htmlFor="companyName">Company Name:</label>
      <input type="text" id="companyName" name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      <br />
      <label htmlFor="logoLink">Logo Link:</label>
      <input type="text" id="logoLink" name="logoLink" value={logoLink} onChange={(e) => setLogoLink(e.target.value)} />
      <br />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default AddCompanyDetails;
