const jwt = require("jsonwebtoken");
const moment = require("moment");
const { API_PERMISSIONS } = require("../consts");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")?.[1];
  if (!token) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
      ignoreExpiration: true,
    });
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Access token not valid" });
    }
    
    if (decoded.exp < moment().unix())
      return res.status(401).json({ success: false, message: "Expired token" });
    const path = req.baseUrl;
    const valid = API_PERMISSIONS?.[path];
    if (!valid) {
      return res.status(404).json({ success: false, message: "URL not found" });
    }
    const role = decoded?.role;
    if (!role) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid role!!" });
    }
    if (!valid.includes(role.code)) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }
    req.userID = decoded.user?.id;
    req.roleID = decoded.role;
    next();
  } catch (e) {
      console.log(e)
    return res
      .status(500)
      .json({ success: false, message: "Permission denied" });
  }
};

module.exports = verifyToken;
