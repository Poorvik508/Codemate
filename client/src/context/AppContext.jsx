import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isloggedin, setisloggedin] = useState(false);
  const [userdata, setuserdata] = useState(null);
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(
        backendUrl+"/api/auth/is-auth"
      );
      if (data.success) {
        setisloggedin(true);
        getUserData();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const getUserData = async () => {
    try {
      const { data } = await axios.get( backendUrl+"/api/user/data");
      data.success ? setuserdata(data.userdata) : toast.error(data.message);
      console.log(data);
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    getAuthState();
  }, []);
  const value = {
    backendUrl,
    isloggedin,
    setisloggedin,
    userdata,
    setuserdata,
    getUserData,
  };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
