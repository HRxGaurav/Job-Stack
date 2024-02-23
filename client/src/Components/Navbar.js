import { useState, useEffect, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import loggedIn from '../APIs/loggedIn';
import Cookies from 'js-cookie';
import userIcon from '../Assets/Icons/user.png'
import style from './Navbar.module.css'
import LogContext from '../Utilities/LogContext';
import RegisterModal from './Models/RegisterModal';
import CoinContext from '../Utilities/CoinContext';
import AppliedContext from '../Utilities/AppliedContext';
import Loader from './Models/Loader';

const Navbar = () => {
    const navigate = useNavigate();

    const [coinBalance, setCoinBalance] = useContext(CoinContext);
    const [userType, setUserType] = useState();
    const [appliedJobIds, setAppliedJobIds] = useContext(AppliedContext);
    const [name, setName] = useState("");
    const [logged, setLogged] = useContext(LogContext);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [loadingState,setLoadingState]= useState(true);

    const logout = () => {
        setLogged(false);
        Cookies.remove('token');
        Cookies.remove('username');
        Cookies.remove('id');
        Cookies.remove('type')
        navigate('/')
    }

    useEffect(() => {
        setName(Cookies.get('username'));
    }, [])
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const userLoggedIn = await loggedIn();
                setLogged(userLoggedIn === 200);
    
                if (userLoggedIn === 200) {
                    // Fetch user profile data
                    setLoadingState(false)
                    const response = await fetch(`${process.env.REACT_APP_BACKEND}/user`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `${Cookies.get('token')}`
                        }
                    });
    
                    if (response.ok) {
                        setLoadingState(false)
                        const data = await response.json();
                        setCoinBalance(data.user.totalCoins);
                        setUserType(data.user.userType==='company')

                    } else {
                        setLoadingState(false)
                        console.error('Failed to fetch user profile data');
                    }
                }
            } catch (error) {
                setLoadingState(false)
                console.error('Error checking user login status:', error);
            }
        };
    
        checkLoggedIn();
        setLoadingState(false)
    }, [logged]); 
    

    return (
        <>
            <nav className={style.navbar}>
                <div className={style.logo} onClick={() => { navigate('/') }} style={{ cursor: 'pointer' }}>Job Nest</div>
                <div className={style.buttons}>
                    {!logged && <button className={style.login_button}><NavLink className={style.navlink_button1} onClick={() => { setShowRegisterModal(!showRegisterModal) }} >Login/Register</NavLink></button>}
                    {logged && <>
                        <h1 className={style.nav_text1}>Coins</h1>
                        <img className={style.coin_icon} src="https://cuvette.tech/app/static/media/coin.ba15d1e4.svg" alt='coin-icon' />
                        <h1 className={style.nav_text1}>{coinBalance}</h1>
                    </>}
                    {logged && <h1 className={style.nav_text} style={{ cursor: 'pointer' }} onClick={() => { navigate('/transaction_history') }}>Transaction History</h1>}
                    {(logged && userType ) &&  <h1 className={style.nav_text} style={{ cursor: 'pointer' }} onClick={() => { navigate('/job_post') }}>Job Post</h1>}
                    {(logged && userType ) &&  <h1 className={style.nav_text} style={{ cursor: 'pointer' }} onClick={() => { navigate('/create_profile') }} >Profile</h1>}
                    {logged && <h1 className={style.nav_text} style={{ cursor: 'pointer' }} onClick={logout}>Logout</h1>}
                    {/* {logged && <img className={style.user_icon} src={userIcon} onClick={() => { navigate('/create_profile') }}  alt='user-icon'></img>} */}


                </div>
            </nav>

            {showRegisterModal && <RegisterModal closeModalState={setShowRegisterModal} />}
            {loadingState && <Loader/>}
        </>
    )
}

export default Navbar;
