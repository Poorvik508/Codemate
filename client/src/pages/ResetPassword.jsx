import React, { useContext, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const inputRefs = useRef([]);
  const [newPassword, setnewpassword] = useState("");
  const [isemailsent, setisemailsent] = useState(false);
  const [otp, setotp] = useState("");
  const [isotpsubmited, setisotpsubmited] = useState(false);

  const handleIndput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handlePast = (e) => {
    const past = e.clipboardData.getData("text");
    const pastArray = past.split("");
    pastArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );
      if (data.success) {
        toast.success(data.message);
        setisemailsent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOtp = (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((e) => e.value);
    setotp(otpArray.join(""));
    setisotpsubmited(true);
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword }
      );
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB] px-4 sm:px-0">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-28 cursor-pointer"
      />

      {/* Email Form */}
      {!isemailsent && (
        <form
          onSubmit={onSubmitEmail}
          className="bg-white p-8 rounded-xl shadow-lg w-full sm:w-96 text-gray-700"
        >
          <h1 className="text-2xl font-semibold text-center mb-4">
            Reset Password
          </h1>
          <p className="text-center mb-6 text-gray-600">
            Enter your registered email address
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-teal-500">
            <img src={assets.mail_icon} alt="" className="w-4 h-4" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email id"
              className="bg-transparent outline-none w-full text-gray-900"
              required
            />
          </div>
          <button className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-full mt-3 transition">
            Submit
          </button>
        </form>
      )}

      {/* OTP Form */}
      {isemailsent && !isotpsubmited && (
        <form
          onSubmit={onSubmitOtp}
          className="bg-white p-8 rounded-xl shadow-lg w-full sm:w-96 text-gray-700"
        >
          <h1 className="text-2xl font-semibold text-center mb-4">
            Reset Password OTP
          </h1>
          <p className="text-center mb-6 text-gray-600">
            Enter the 6-digit code sent to your email id
          </p>
          <div className="flex justify-between mb-8" onPaste={handlePast}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  required
                  className="w-12 h-12 bg-white text-gray-900 text-center text-xl rounded-md border border-teal-500"
                  ref={(e) => (inputRefs.current[index] = e)}
                  onInput={(e) => handleIndput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition">
            Submit
          </button>
        </form>
      )}

      {/* New Password Form */}
      {isemailsent && isotpsubmited && (
        <form
          onSubmit={onSubmitNewPassword}
          className="bg-white p-8 rounded-xl shadow-lg w-full sm:w-96 text-gray-700"
        >
          <h1 className="text-2xl font-semibold text-center mb-4">
            New Password
          </h1>
          <p className="text-center mb-6 text-gray-600">
            Enter your new password below
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-teal-500">
            <img src={assets.lock_icon} alt="" className="w-4 h-4" />
            <input
              value={newPassword}
              onChange={(e) => setnewpassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none w-full text-gray-900"
              required
            />
          </div>
          <button className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-full mt-3 transition">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
