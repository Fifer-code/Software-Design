const users = require('../models/users.js');


exports.register = (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Require all core fields for registration.
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      error: "First name, last name, email, and password are required"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: "Please provide a valid email address"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long"
    });
  }

  // Allow duplicate names, but enforce unique email addresses.
  const existing = users.find(u => u.email === email);

  if (existing) {
    return res.status(400).json({
      error: "Email already in use"
    });
  }

  const newUser = {
    id: users.length + 1,
    firstName,
    lastName,
    email,
    password,
    role: "user"
  };

  users.push(newUser);

  res.status(201).json({
    message: "User registered",
    user: newUser
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password required"
    });
  }

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  res.json({
    message: "Login successful",
    role: user.role
  });
};