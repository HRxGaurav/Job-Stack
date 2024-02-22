import Cookies from "js-cookie";

const loggedIn = async () => {
  
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND}/loggedin`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${Cookies.get("token")}`,
      },
    });

    if (response.status !== 200) {
      Cookies.remove('token');
      Cookies.remove('username');
      Cookies.remove('id');
    }
    return response.status;
  } catch (error) {
    return (false);
  }
};

export default loggedIn;
