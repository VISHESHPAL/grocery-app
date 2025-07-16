import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useLocation } from 'react-router-dom';

const Loading = () => {
  const { navigate, fetchUser } = useAppContext();
  const { search } = useLocation();

  const query = new URLSearchParams(search);
  const nextUrl = query.get('next') || ""; // fallback to home if next is null

  useEffect(() => {
    const restoreSessionAndRedirect = async () => {
      await fetchUser(); // ✅ Restore user from cookie
      setTimeout(() => {
        navigate(`/${nextUrl}`);
      }, 2000); // 2 seconds is enough
    };

    restoreSessionAndRedirect();
  }, [nextUrl]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-300 border-t-primary"></div>
    </div>
  );
};

export default Loading;
