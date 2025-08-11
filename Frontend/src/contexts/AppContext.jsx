import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import { toast } from "react-toastify";
import axios from "axios";

const backendURL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_LOCAL_URL
    : import.meta.env.VITE_LIVE_URL;

axios.defaults.withCredentials = true;
axios.defaults.baseURL = backendURL;

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItem, setCartItem] = useState({});
  const [searchQuery, setSearchQuery] = useState({});

  // fetch seller status

  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  // fetch user auth status

const fetchUser = async () => {
  try {
    const { data } = await axios.get(`/api/user/is-auth`);
    if (data.success) {
      setUser(data.user);
      setCartItem(data.user.cartItem || {}); 
      // console.log("🧠 Cart loaded from DB:", data.user.cartItem);
    }
  } catch (error) {
    setUser(null);
  }
};


  const currency = import.meta.env.VITE_CURRENCY || "$";

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchSeller();
    fetchProducts();
    fetchUser();
  }, []);

  // update database cart item

  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItem });
        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };
    if (user) {
      updateCart();
    }
  }, [cartItem]);

  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItem || {});
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItem(cartData);
    toast.success("Added to Cart");
  };

  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItem);
    cartData[itemId] = quantity;
    setCartItem(cartData);
    toast.success("Cart Updated");
  };

  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItem);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
    }
    setCartItem(cartData);
    toast.success("Removed from Cart");
  };

  // Get the Cart Item

  const getCartCount = () => {
    let totalCount = 0;
    for (const item in cartItem) {
      totalCount += cartItem[item];
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItem) {
      const itemInfo = products.find((product) => product._id === itemId);
      if (itemInfo && cartItem[itemId] > 0) {
        totalAmount += itemInfo.offerPrice * cartItem[itemId];
      }
    }
    return Math.floor(totalAmount); // You don't need *100/100
  };

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    showUserLogin,
    setShowUserLogin,
    setProducts,
    products,
    currency,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartItem,
    setCartItem,
    searchQuery,
    setSearchQuery,
    getCartAmount,
    getCartCount,
    axios,
    fetchProducts,
    fetchUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
