import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './JobCards.module.css';
import LogContext from '../Utilities/LogContext';
import AppliedContext from '../Utilities/AppliedContext';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const JobCards = (props) => {
  const [logged] = useContext(LogContext);
  const [appliedJobIds, setAppliedJobIds] = useContext(AppliedContext);
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [userType, setUserType]=useState();



  const { job_position, logo_url, min_ctc, max_ctc, job_type, experienceRequired, location, companyName, id, requiredRupees } = props;



  useEffect(() => {
    setUserType(Cookies.get('usertype')==='company')
  
    
  }, [])
  
  const handleApplyJob = async () => {
    setApplying(true); 

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Cookies.get('token')
        },
        body: JSON.stringify({ jobId: id }) 
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setAppliedJobIds([...appliedJobIds, id]); 
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error('Error applying for job');
    } finally {
      setApplying(false); 
    }
  };

  return (
    <>
      <div className={style.card_main}>
        <div className={style.card_left}>
          <div className={style.card_image}>
            <img className={style.company_logo} src={logo_url} alt="logo" />
          </div>
          <div className={style.job_grid}>
            <div className={style.card_detail}>
              <div
                className={style.job_position}
              >{`${companyName} (${job_position})`}</div>
              <div className={style.job_feed}>
                <div
                  className={style.jobPay}
                >{`₹ ${min_ctc} - ${max_ctc} `}</div>
                <div className={style.jobPay}>{location}</div>
              </div>
              <div className={style.job_types}>
                <div
                  className={style.job_type}
                >{`Location ${experienceRequired}`}</div>
                <div className={style.job_type}>{job_type}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={style.card_right}>
          <div className={style.card_skill}>
            <div className={style.job_details}>
              {!userType && (
                <>
                  {applying ? (
                    <button className={style.view_job} disabled>
                      Applying...
                    </button>
                  ) : (
                    <button className={style.view_job} onClick={handleApplyJob}>
                      Apply using {requiredRupees} Rupees
                    </button>
                  )}
                </>
              )}

              {userType && (
                <button className={style.view_job_applied}>
                  Only Student can apply
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobCards;
