import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/images.png";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

function login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  // LOGIN DATA
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // MESSAGE STATE
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // HANDLE INPUT
  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://wms-wrnh.onrender.com/login",

        loginData,
      );

      // SUCCESS MESSAGE
      setMessage(res.data.message);

      setMessageType("success");

      // SAVE USER DATA
      localStorage.setItem("name", res.data.name);

      localStorage.setItem("email", res.data.email);

      localStorage.setItem("role", res.data.role);

      // AUTO HIDE MESSAGE
      setTimeout(() => {
        setMessage("");
      }, 3000);

      // ROLE
      const role = res.data.role;

      // NAVIGATION
      setTimeout(() => {
        if (role === "Administrator") {
          navigate("/administrator");
        } else if (role === "Reader") {
          navigate("/reader");
        } else if (role === "Publisher") {
          navigate("/publisher");
        }
      }, 1000);
    } catch (error) {
      // ERROR MESSAGE
      setMessage("Invalid Email or Password");

      setMessageType("error");

      // AUTO HIDE
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -100,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        x: 100,
        scale: 0.95,
      }}
      transition={{
        duration: 0.6,
        ease: "easeInOut",
      }}
      className="h-screen bg-[#eef3f9] flex items-center justify-center px-4"
    >
      <div className="w-full max-w-5xl min-h-[80vh] bg-white rounded-[30px] shadow-2xl overflow-hidden grid lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex bg-[#0B4EA2] relative flex-col justify-center items-center p-10 overflow-hidden">
          {/* GLOW EFFECT */}
          <div className="absolute w-80 h-80 bg-orange-400/20 rounded-full -top-10 -left-10 blur-3xl"></div>

          {/* LOGO */}
          <img src={logo} alt="logo" className="w-56 object-contain z-10" />

          {/* CONTENT */}
          <div className="z-10 text-center mt-8">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Welcome To
              <span className="block text-orange-400">E-Book Hub</span>
            </h1>

            <p className="text-white/80 text-base leading-7 mt-6">
              Login and continue your professional digital reading experience
              with our smart E-Book Management platform.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            {/* MOBILE LOGO */}
            <div className="flex justify-center lg:hidden mb-5">
              <img src={logo} alt="logo" className="w-36" />
            </div>

            {/* TITLE */}
            <h2 className="text-4xl font-bold text-[#0B4EA2] mb-2">Login</h2>

            <p className="text-gray-500 mb-7">Sign in to continue</p>

            {/* MESSAGE UI */}
            {/* MODERN MESSAGE UI */}
            {/* MODERN POPUP MESSAGE UI */}
            {message && (
              <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 z-[9999] animate-pulse">
                <div
                  className={`min-w-[320px] max-w-[400px]
      px-5 py-4 rounded-2xl shadow-2xl
      border backdrop-blur-lg
      flex items-start gap-4
      transition-all duration-500

      ${
        messageType === "success"
          ? "bg-green-500/15 border-green-400 text-green-700"
          : "bg-red-500/15 border-red-400 text-red-700"
      }`}
                >
                  {/* ICON */}
                  <div
                    className={`w-12 h-12 rounded-xl
        flex items-center justify-center
        text-white text-xl font-bold

        ${messageType === "success" ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {messageType === "success" ? "✓" : "!"}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <h2 className="font-bold text-lg">
                      {messageType === "success" ? "Success" : "Failed"}
                    </h2>

                    <p className="text-sm mt-1 leading-6">{message}</p>
                  </div>

                  {/* CLOSE BUTTON */}
                  <button
                    onClick={() => setMessage("")}
                    className="text-xl font-bold opacity-70 hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="text-[#0B4EA2] font-semibold">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  required
                  value={loginData.email}
                  placeholder="Enter your email"
                  onChange={handleChange}
                  className="w-full mt-2 border border-gray-300 p-3 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-[#0B4EA2] font-semibold">Password</label>

                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={loginData.password}
                    placeholder="Enter password"
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 pr-14 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0B4EA2]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* BUTTON */}
              <button className="w-full bg-[#0B4EA2] hover:bg-[#083c7d] text-white font-bold p-3 rounded-xl shadow-lg transition duration-300">
                Login
              </button>
            </form>

            {/* SIGNUP LINK */}
            <p className="text-center mt-6 text-gray-500">
              Don’t have an account?
              <Link to="/signup" className="text-orange-400 font-bold ml-2">
                Signup
              </Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default login;
