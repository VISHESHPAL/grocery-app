import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized: Token Missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.id) {
      req.user = { _id: decoded.id }; // ✅ FIXED LINE
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Not Authorized: Invalid Token",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token verification failed: " + error.message,
    });
  }
};

export default authUser;
