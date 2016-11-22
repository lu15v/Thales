var express    = require('express');
var controller = require('../relay-controller');

var router     = express.Router();
var SENSOR_MAP = controller.SENSOR_MAP;
var IS_READY   = false;

controller.boardReady.then(function(five, board) {
  console.log('Board ready');
  IS_READY = true;
});

var checkBoard = function(req, res, next) {
  if (!IS_READY) {
    console.error("BOARD NOT READY");
    return next(new Error('BOARD NOT READY'));
  }

  next();
}

/**
 * ROUTES
 **/
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/switches', function(req, res, next) {
  res.render('switches', {});
});
router.get('/manual', function(req, res, next) {
  res.render('manual', {});
});
router.get('/test', function(req, res, next) {
  res.render('test', {});
});
router.get('/status', checkBoard, function(req, res, next) {
  console.log(SENSOR_MAP);
  res.status(200).json(SENSOR_MAP);
});

/**
 * HTTP POST
 * BODY:
 *  sensor [string]
 *  clasif [string]: pre | pos
 **/
router.post('/toggle', checkBoard, function(req, res, next) {
  var sensor = req.body.sensor.toUpperCase();
  var clasif = req.body.clasif.toLowerCase();

  console.log('Toggling ' + sensor);
  controller.toggleSensor(clasif, sensor);
  console.log(SENSOR_MAP);
  res.status(200).json(SENSOR_MAP);
});
router.post('/toggle/all', checkBoard, function(req, res, next) {
  controller.toggleAll();

  res.status(200).json(SENSOR_MAP);
});
router.post('/manual_test', checkBoard, function(req, res, next) {
  var body = req.body;

  if (body.first['sensor'] != 'BO') {
    return res.status(400).json('BO should be the first signal activated');
  }

});

module.exports = router;

