const User = require("../models/User");

const getAllUsers = async (req, res) => {
   try {
      const { search } = req.query;
      let query = {};
      if (search) {
         query = { name: { $regex: search, $options: "i" } }; // case-insensitive search
      }
      const users = await User.find(query).limit(20); // limit results for suggestions
      res.status(200).json(users);
   } catch (err) {
      res.status(500).json({
         message: "Error fetching users",
         error: err.message,
      });
   }
};

module.exports = {
   getAllUsers,
};
