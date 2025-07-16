import Address from "../model/address.js";

// Add Address
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;

    await Address.create({ ...address, userId: req.user._id });

    res.json({
      success: true,
      message: "Address Added Successfully!",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get Address
export const getAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });

    res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
