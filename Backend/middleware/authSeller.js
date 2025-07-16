import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized: No token provided",
    });
  }

  try {
    const tokenDecode = jwt.verify(sellerToken, process.env.JWT_SECRET);

    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      return next(); // ✅ Only call once
    } else {
      return res.status(403).json({
        success: false,
        message: "Not Authorized: Invalid seller email",
      });
    }
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token verification failed: " + error.message,
    });
  }
};

export default authSeller;
