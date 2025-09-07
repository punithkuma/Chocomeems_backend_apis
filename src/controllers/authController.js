const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Instructor = require('../models/Instructor');
const Student = require('../models/Student');

function signToken(userId, role) {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
}

async function signup(model, req, res) {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing name/email/password' });
  const exists = await model.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await model.create({ name, email, passwordHash, phone });
  const role = model.modelName.toLowerCase(); // 'instructor' or 'student'
  const token = signToken(user._id, role);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone,  role } });
}

async function login(model, req, res) {
  const { email, password } = req.body;
  const user = await model.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid email credentials' });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid password credentials' });
  const role = model.modelName.toLowerCase();
  const token = signToken(user._id, role);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role } });
}

async function studentsLists(model, req, res) {
   try {
    const students = await model.find(); 
    res.status(200).json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
}


module.exports = {
  instructorSignup: (req, res) => signup(Instructor, req, res),
  instructorLogin: (req, res) => login(Instructor, req, res),
  studentSignup: (req, res) => signup(Student, req, res),
  studentLogin: (req, res) => login(Student, req, res),
  studentLists: (req, res) => studentsLists(Student, req, res),
};
