import jwt from "jsonwebtoken";
const SECRET = "something";
const authenticate = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    token = token.split(" ")[1];
    const user = jwt.verify(token, SECRET);
    req.role = user.role;
    req.userId = user.id; // Add user ID to request for better tracking
    req.userEmail = user.email;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Access Denied - Invalid token" });
  }
};

const authorize = (role) => {
  return (req, res, next) => {
    if (req.role === role) {
      next();
    } else {
      return res.json({ message: "Unauthorized Access" });
    }
  };
};

export {authenticate,authorize}