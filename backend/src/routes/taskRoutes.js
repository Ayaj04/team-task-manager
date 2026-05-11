const express = require('express');
const router = express.Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const taskController = require('../controllers/taskController');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

router.post('/', verifyToken, taskController.createTask);
router.get('/', verifyToken, taskController.getTasks);
router.patch('/:taskId', verifyToken, taskController.updateTask);
router.delete('/:taskId', verifyToken, taskController.deleteTask);

module.exports = router;