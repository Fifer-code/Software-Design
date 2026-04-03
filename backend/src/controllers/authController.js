const bcrypt = require('bcryptjs');
const UserCredentials = require('../models/userCredentials.js');
const UserProfile = require('../models/userProfile.js');

const PASSWORD_MIN_LENGTH = 6;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 100;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({
      error: 'First name, last name, email, and password are required'
    });
  }

  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (trimmedFirstName.length < NAME_MIN_LENGTH || trimmedFirstName.length > NAME_MAX_LENGTH) {
    return res.status(400).json({
      error: `First name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`
    });
  }

  if (trimmedLastName.length < NAME_MIN_LENGTH || trimmedLastName.length > NAME_MAX_LENGTH) {
    return res.status(400).json({
      error: `Last name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`
    });
  }

  if (normalizedEmail.length > EMAIL_MAX_LENGTH) {
    return res.status(400).json({
      error: `Email cannot exceed ${EMAIL_MAX_LENGTH} characters`
    });
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return res.status(400).json({
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({
      error: 'Please provide a valid email address'
    });
  }

  const existingCredential = await UserCredentials.findOne({ email: normalizedEmail });

  if (existingCredential) {
    return res.status(400).json({
      error: 'Email already in use'
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let credential = null;

  try {
    credential = await UserCredentials.create({
      email: normalizedEmail,
      passwordHash,
      role: 'user'
    });

    const fullName = `${trimmedFirstName} ${trimmedLastName}`;
    await UserProfile.create({
      credentialId: credential._id,
      fullName,
      email: normalizedEmail,
      contactInfo: '',
      preferences: {}
    });

    return res.status(201).json({
      message: 'User registered',
      user: {
        id: credential._id,
        fullName,
        email: credential.email,
        role: credential.role
      }
    });
  } catch (error) {
    if (credential?._id) {
      await UserCredentials.deleteOne({ _id: credential._id }).catch(() => {});
      await UserProfile.deleteOne({ credentialId: credential._id }).catch(() => {});
    }

    if (error?.code === 11000) {
      return res.status(400).json({
        error: 'Email already in use'
      });
    }

    return res.status(500).json({
      error: 'Unable to register user'
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({
      error: 'Email and password required'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserCredentials.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({
      error: 'Invalid credentials'
    });
  }

  res.json({
    message: 'Login successful',
    role: user.role
  });
};