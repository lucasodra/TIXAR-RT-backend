
const express = require('express');
const eventController = require('../controllers/eventController');  // Adjust the path as necessary
const router = express.Router();
const {isAuthenticated} = require('../middlewares/auth');
const upload = require('../middlewares/uploadMiddleware');


// PUBLIC ROUTE

// 1) Event Operations:
router.route('/')
    .get(eventController.getAllEvents);

// PRIVATE ROUTE
router.use(isAuthenticated);

// 1) Event Operations:
router.route('/')
    .post(upload.fields([
        { name: 'artistImage', maxCount: 1 },
        { name: 'concertImage', maxCount: 1 }]),eventController.createEvent);

router.route('/:id')
    .get(eventController.getEventById)
    .put(upload.fields([
        { name: 'artistImage', maxCount: 1 },
        { name: 'concertImage', maxCount: 1 }]),eventController.updateEvent)
    .delete(eventController.deleteEvent);

// 2) SalesRound Operations:
router.route('/:eventId/currentRound')
    .get(eventController.getCurrentSalesRound);

router.route('/:eventId/salesRound')
    .get(eventController.getAllSalesRounds)
    .post(eventController.createSalesRound);

router.route('/:eventId/salesRound/:salesRoundId')
    .get(eventController.getSalesRoundById)
    .put(eventController.updateSalesRound)
    .delete(eventController.deleteSalesRound);

// 3) Prices in Sales Round Operations:
router.route('/:eventId/salesRound/:salesRoundId/prices/:category')
    .post(eventController.addPriceToSalesRound)
    .put(eventController.updatePriceInSalesRound)
    .delete(eventController.deletePriceFromSalesRound);

// 4) Sessions Operations:
router.route('/:eventId/sessions')
    .get(eventController.getAllSessions)
    .post(eventController.addSession);

router.route('/:eventId/sessions/:sessionId')
    .get(eventController.getSessionById)
    .put(eventController.updateSession)
    .delete(eventController.deleteSession);

// 5) categoryCapacity in Sales Round Operations:
router.route('/:eventId/sessions/:sessionId/categoryCapacity')
    .post(eventController.addCategoryCapacity);

router.route('/:eventId/sessions/:sessionId/categoryCapacity/:categoryIndex/:category')
    .put(eventController.updateCategoryCapacity)
    .delete(eventController.deleteCategoryCapacity);

module.exports = router;
