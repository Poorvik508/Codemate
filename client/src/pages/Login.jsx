import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const { backendUrl, setisloggedin, getUserData } = useContext(AppContext);
  const [state, setstate] = useState("Sign Up");
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;
      if (state === "Sign Up") {
        const { data } = await axios.post(backendUrl + "/api/auth/register", {
          name,
          email,
          password,
        });
        if (data.success) {
          setisloggedin(true);
          await getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/auth/login", {
          email,
          password,
        });
        if (data.success) {
          setisloggedin(true);
          await getUserData();
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-white to-[#14B8A6]">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-28 cursor-pointer"
      />
      <div className="bg-[#F9FAFB] p-10 rounded-lg shadow-lg w-full sm:w-96 text-gray-700 text-sm">
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6 text-gray-600">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>
        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => setname(e.target.value)}
                value={name}
                className="bg-transparent outline-none w-full"
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setemail(e.target.value)}
              value={email}
              className="bg-transparent outline-none w-full"
              type="email"
              placeholder="Email Id"
              required
            />
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setpassword(e.target.value)}
              value={password}
              className="bg-transparent outline-none w-full"
              type="password"
              placeholder="Password"
              required
            />
          </div>
          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-[#14B8A6] cursor-pointer text-sm text-right"
          >
            Forgot Password?
          </p>
          <button className="text-white font-bold w-full py-2.5 rounded-full bg-gradient-to-r from-[#14B8A6] to-[#0d9488] transition">
            {state}
          </button>
        </form>
        {state === "Sign Up" ? (
          <p className="text-gray-600 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setstate("Login")}
              className="text-[#14B8A6] cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-600 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setstate("Sign Up")}
              className="text-[#14B8A6] cursor-pointer underline"
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
