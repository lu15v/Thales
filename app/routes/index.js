var express    = require('express');
var Promise    = require('promise');
var Q          = require('q');
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
router.get('/manual', function(req, res, next) {
  res.render('switches', {});
});
router.get('/auto', function(req, res, next) {
  res.render('auto', {});
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
/**
 * HTTP POST
 * with empty body to toggle every sensor
 *
 */
router.post('/toggle/all', checkBoard, function(req, res, next) {
  controller.toggleAll();

  res.status(200).json(SENSOR_MAP);
});
/**
 * HTTP POST with empty body.
 * Simulates a single vehicle of a specific category
 * URL PARAMS:
 * :clasif - PRE | POS
 * :category - One of the VEHICLES_LIST
 *
 */
router.post('/simulate/:clasif/:category', checkBoard, function(req, res, next) {
  var clasif   = req.params.clasif;
  var category = req.params.category;

  console.log('Calling... ', clasif, category);
  var simulation = controller['simulate' + category](clasif);
  simulation.then(function() {
    res.status(200).json({ status: 'COMPLETE'});
  });
});
/**
 * HTTP POST
 * Simulates a bunch of vehicles.
 * Body: { category: number_of_vehicles }
 * e.g.
 * {
 *    '1A': 4,
 *    '2B': 2,
 *    '3C': 4
 * }
 *
 */
router.post('/simulate/:clasif', function(req, res, next) {
  var clasif = req.params.clasif;
  var simulation = req.body;
  console.log("Simulatig the following vehicles in " + clasif + "-CLA");
  console.log(simulation);
  var functions = [];
  for (category in simulation) {
    var amount = +simulation[category];
    for(var i = 0; i < amount; i++) {
      var fn = controller["simulate" + category].bind(undefined, clasif);
      functions.push(fn);
    }
  }
  console.log(functions);

  var result = functions.reduce(Q.when, Q());
  result.done()
    .then(function() {
      res.status(200).send('OK');
    }).catch(function() {
      res.status(500).send('ERROR');
    });
});

module.exports = router;

