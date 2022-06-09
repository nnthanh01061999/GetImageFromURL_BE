const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

const { verifyToken } = require("../midlewares");

const User = require("../models/UserModel");
const Role = require("../models/RoleModel");
const { generateToken, generateRefreshToken } = require("../utils/jwt");
const { ObjectId } = require("bson");

// @route GET api/auth
// @desc check User if has token
// @access Public
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne(
      { _id: req.userID },
      { refresh_token: 0, password: 0 }
    ).populate({ path: "role", select: ["code", "name"] });
    if (!user)
      return res.status(403).json({ success: false, message: "Invalid User" });
    return res.status(200).json({
      success: true,
      data: {
        user: user,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
});
// @route POST api/auth/register
// @desc Register User
// @access Public
router.post("/register", async (req, res) => {
  const { email, password, name, nick_name, avatar, birth_day } = req.body;
  //simple validation
  if (!email || !password || !name)
    return res.status(400).json({ success: false, message: "Invalid Info" });
  try {
    //check existed
    const user = await User.findOne({ email: email });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Email have been used. Try other." });

    // all good
    const hashPassword = await argon2.hash(password);

    const role_user = await Role.findOne({ code: "user" });
    if (!role_user)
      return res
        .status(500)
        .json({ success: false, message: "User role invalid" });
    const newUser = new User({
      email,
      password: hashPassword,
      name,
      nick_name,
      avatar,
      birth_day,
      role: ObjectId(role_user._id).toString(),
    });
    await newUser.save();

    return res.json({
      success: true,
      message: "Đăng ký thành công",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// @route POST api/auth/login
// @desc Login User
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  //simple validation
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "Invalid information" });
  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const passwordValid = await argon2.verify(user.password, password);

    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const role = await Role.findById(user.role);

    const accessToken = await generateToken(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          nick_name: user.nick_name,
          avatar: user.avatar,
        },
        role: {
          id: role._id,
          code: role.code,
          name: role.name,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_LIFE
    );
    let refreshToken = await generateRefreshToken();

    if (!user.refresh_token) {
      const user_ = await User.findByIdAndUpdate(
        user._id,
        { refresh_token: refreshToken },
        { new: true }
      );
      console.log(user_);
    } else {
      refreshToken = user.refresh_token;
    }

    return res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const authHeader = req.header("Authorization");
    const access_token = authHeader?.split(" ")?.[1];
    if (!refresh_token || !access_token) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET, {
      ignoreExpiration: true,
    });

    const user = await User.findOne({ _id: decoded.user?.id });
    if (!user)
      return res.status(403).json({ success: false, message: "Invalid user" });
    if (user.refresh_token !== refresh_token)
      return res
        .status(400)
        .json({ success: false, message: "Invalid refresh token" });

    const accessToken = await generateToken(
      {
        user: {
          ...decoded.user,
        },
        role: {
          ...decoded.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_LIFE
    );

    return res.status(200).json({
      success: true,
      message: {
        accessToken: accessToken,
        refresh_token: refresh_token,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.toString() });
  }
});

module.exports = router;
