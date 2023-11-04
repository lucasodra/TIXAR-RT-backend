
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController'); // Replace with the actual path to your userController file
const { isAuthenticated } = require('../middlewares/auth');

// PRIVATE ROUTE
router.use(isAuthenticated);

// Purchase Ticket
router.route('/')
    .post(transactionController.purchaseTicketTransaction);

router.route('/:id')
    .delete(transactionController.deleteTicketTransaction);

module.exports = router;