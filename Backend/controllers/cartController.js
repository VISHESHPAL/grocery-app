import User from "../model/User.js";

export const updateCart = async (req, res) => {
  try {
    const { cartItem } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, // ✅ use req.user._id instead of req.userId
      { cartItem },
      { new: true }
    );

    res.json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.log("❌ Error in updateCart:", error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
