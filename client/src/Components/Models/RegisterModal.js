import React, { useState, useEffect, useContext } from "react";
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import style from './RegisterModal.module.css';
import toast from 'react-hot-toast';
import LogContext from '../../Utilities/LogContext.js'
import Loader from './Loader.js'


function RegisterModal({ closeModalState }) {
    const [formData, setFormData] = useState({ email: '', otp: '' });
    const [showOtpDiv, setShowOtpDiv]=useState(false);
    const [logged, setLogged] = useContext(LogContext);
    const [loadingState,setLoadingState]= useState(false);
    const navigate = useNavigate();

    const handleContainerClick = (event) => {
        event.stopPropagation();
    };

    const closeModal = () => {
        closeModalState(false);
    };
   

    // Stop scrolling when modal is open
    useEffect(() => {
        const body = document.body;

        if (closeModalState) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = 'auto';
        }

        return () => {
            body.style.overflow = 'auto';
        };
    }, [closeModalState]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateEmail = (email) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    };

    const handleSignRequest = async () => {
        if (showOtpDiv) {
            setLoadingState(true);
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND}/verify_otp`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email: formData.email, otp: formData.otp, userType: formData.userType })
                });
                const data = await response.json();
                
                if (response.ok) {
                    // OTP verification successful
                    setLogged(true);
                    setLoadingState(false);
                    closeModalState(false);
    
                    Cookies.set('token', data.token, { expires: 7 });
                    Cookies.set('username', data.username, { expires: 7 });
                    Cookies.set('id', data.id, { expires: 7 });
                    
                } else {
                    // OTP verification failed
                    setLoadingState(false);
                    toast.error(data.message);
                }
            } catch (error) {
                // Handle fetch error
                setLoadingState(false);
                console.error("Error verifying OTP:", error);
                toast.error("Error verifying OTP");
            }
        } else {
            // Request OTP 
            setLoadingState(true);
            if (validateEmail(formData.email)) {
                // Email is valid
                try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND}/send_otp`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email: formData.email, userType: formData.userType })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        // OTP sent successfully
                        toast.success(data.message);
                        setLoadingState(false);
                        setShowOtpDiv(true);
                    } else {
                        // OTP sending failed
                        setLoadingState(false);
                        toast.error(data.message);
                    }
                } catch (error) {
                    setLoadingState(false);
                    toast.error("Error sending OTP");
                }
            } else {
                // Invalid email, show error
                setLoadingState(false);
                toast.error('Invalid email');
            }
        }
    };
    


    return ReactDOM.createPortal(
        <>
            <div className={style.modalBackground} onClick={closeModal}>
            <div className={style.modalContainer} onClick={handleContainerClick}>
                <div className={style.crossButton} onClick={closeModal}>X</div>
                <div className={style.heading}>Register/Login to JobNest</div>
                
                <div className={style.radioContainer}>
                    <label className={style.radioLabel}>
                        <input
                            type="radio"
                            value="company"
                            checked={formData.userType === 'company'}
                            onChange={() => setFormData({...formData, userType: 'company'})}
                        />
                        Company
                    </label>
                    <label className={style.radioLabel}>
                        <input
                            type="radio"
                            value="student"
                            checked={formData.userType === 'student'}
                            onChange={() => setFormData({...formData, userType: 'student'})}
                        />
                        Student
                    </label>
                </div>
                <div className={style.inputFields}>
                    <div className={style.inputDiv}>
                        <label className={style.username}>Email</label>
                        <input className={style.usernameInput} type="email" name="email" placeholder='Enter email' value={formData.email} onChange={handleChange} autoComplete='off' readOnly={showOtpDiv ? true : false} />
                    </div>
                    {showOtpDiv && <div className={style.passwordDiv}>
                        <label className={style.password}>OTP</label>
                        <input className={style.passwordInput} type="number" name="otp" placeholder='Enter OTP' value={formData.otp} onChange={handleChange} autoComplete='off' inputMode="numeric" />
                    </div>}
                </div>
                <div className={style.registerButton} onClick={handleSignRequest}>{showOtpDiv ? 'Continue' : 'Request OTP'}</div>
            </div>
        </div>

            {loadingState && <Loader/>}

            
        </>,
        document.getElementById('portal')
    );
}

export default RegisterModal;
