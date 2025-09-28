import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  //console.log("👉 Token received:", token); // debug!

  if (!token) return res.status(401).json({ message: "Token not provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user; 
    next();
  });
};

export default authenticateToken;
