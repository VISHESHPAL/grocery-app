import React, { useEffect, useState } from "react";
import { useAppContext } from "../../contexts/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const SellerLogin = () => {
  const { isSeller, setIsSeller, navigate, axios } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isSeller) {
      navigate("/seller");
    }
  }, [isSeller]);

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      const { data } = await axios.post("/api/seller/login", {
        email,
        password,
      });
      if (data.success) {
        setIsSeller(true);
        navigate("/seller");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    !isSeller && (
      <form
        onSubmit={onSubmitHandler}
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-sm text-gray-700"
      >
        <div className="flex flex-col gap-6 w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <p className="text-2xl font-semibold text-center">
            <span className="text-primary">Seller</span> Login
          </p>

          <div className="w-full">
            <label className="block mb-1 font-medium">Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Enter your email"
              className="border border-gray-300 rounded-md w-full px-3 py-2 outline-primary focus:ring-1 focus:ring-primary focus:border-primary transition"
              required
            />
          </div>

          <div className="w-full">
            <label className="block mb-1 font-medium">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Enter your password"
              className="border border-gray-300 rounded-md w-full px-3 py-2 outline-primary focus:ring-1 focus:ring-primary focus:border-primary transition"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark transition text-white font-medium w-full py-2 rounded-md shadow-sm"
          >
            Login
          </button>
        </div>
      </form>
    )
  );
};

export default SellerLogin;
