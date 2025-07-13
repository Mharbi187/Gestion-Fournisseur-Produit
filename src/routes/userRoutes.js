const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// CRUD Routes
router.get('/', userController.getUsers);           // GET all users
router.get('/:id', userController.getUserById);    // GET single user
router.post('/', userController.createUser);       // POST create user
router.put('/:id', userController.updateUser);     // PUT update user
router.delete('/:id', userController.deleteUser);  // DELETE user

module.exports = router;