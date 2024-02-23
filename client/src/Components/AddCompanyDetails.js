import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';


const AddCompanyDetails = () => {
  const [companyName, setCompanyName] = useState('');
  const [logoLink, setLogoLink] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const requestData = { companyName, logoLink };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/company/add-details`, {
        method: 'POST',
        headers: {
          'Authorization': `${Cookies.get('token')}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(requestData) 
      });

      if (response.ok) {
        toast.success('Company details added successfully')
        console.log('Company details added successfully');
        navigate('/')
      } else {
        console.error('Failed to add company details:', response.status);
      }
    } catch (error) {
      console.error('Error adding company details:', error);
    }
  };

  return (
    <>
    <br/><br/><br/><br/><br/>
    
    <div className="add-company-details-container">
      <h2>Add Company Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="companyName">Company Name:</label>
          <input type="text" id="companyName" name="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="logoLink">Logo Link:</label>
          <input type="text" id="logoLink" name="logoLink" value={logoLink} onChange={(e) => setLogoLink(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div></>
  );
};

export default AddCompanyDetails;
