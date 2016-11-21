var express = require('express');
var Promise = require('promise');
var five    = require('johnny-five');
var raspi   = require('raspi-io');

var router  = express.Router();

/**
 * GLOBAL VARS
 **/
var GAP_TIME   = 50;
var STD_TIME   = 100;
var IS_READY   = false;
var SENSOR_MAP = {
  pre: {
    'BP': { active: false, pin: 0 },
    'BO': { active: false, pin: 2 },
    'E1': { active: false, pin: 3 },
    'E2': { active: false, pin: 4 },
    'A1': { active: false, pin: 5 },
    'A2': { active: false, pin: 6 }
  },
  pos: {
    'BP': { active: false, pin: 21 },
    'BO': { active: false, pin: 22 },
    'E1': { active: false, pin: 23 },
    'A1': { active: false, pin: 25 },
    'A2': { active: false, pin: 27 }
  },
}

/**
 * BOARD EVENTS
 **/
var board = new five.Board({
  io: new raspi(),
  repl: false,
  debug: false
});
var board-ready = new Promise(function(resolve, reject) {
  board.on('ready', function() {
    IS_READY = true;
    resolve(five, board);
  });
});
board-ready.then(function(five, board) {
  console.log('Board ready');
  var led = new five.Led(2);
  led.on();
});
var check-board = function(req, res, next) {
  if (!IS_READY) {
    console.error("BOARD NOT READY");
    next('BOARD NOT READY', req, res, next);
  } else {
    next();
  }
}

/**
 * ROUTES
 **/

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/manual', function(req, res, next) {
  res.render('manual', {});
});
router.get('/status', check-board, function(req, res, next) {
  console.log(SENSOR_MAP);
  res.status(200).json(SENSOR_MAP);
});

/**
 * HTTP POST
 * BODY:
 *  sensor [string]
 *  clasif [string]: pre | pos
 **/
router.post('/toggle', check-board, function(req, res, next) {
  var sw     = req.body.sensor.toUpperCase();
  var clasif = req.body.clasif.toLowerCase();
  var status = SENSOR_MAP[clasif][sw];

  SENSOR_MAP[clasif][sw] = !status;

  console.log(SENSOR_MAP);
  res.status(200).json(SENSOR_MAP);
});

module.exports = router;
