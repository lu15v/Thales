var express = require('express');
var router  = express.Router();

var SENSOR_MAP = {
  pre: {
  'BP': false,
  'BO': false,
  'E1': false,
  'E2': false,
  'A1': false,
  'A2': false
  },
  pos: {
  'BP': false,
  'BO': false,
  'E1': false,
  'A1': false,
  'A2': false
  }
}

var Sensor = function(type, time) {
  return {
    sensor: type,
    time: time
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/manual', function(req, res, next) {
  res.render('manual', {});
});

router.get('/status', function(req, res, next) {
  res.status(200).json(SENSOR_MAP);
});

router.post('/toggle', function(req, res, next) {
  var sw     = req.body.sensor;
  var clasif = req.body.clasif.toLowerCase();
  var status = SENSOR_MAP[clasif][sw];

  SENSOR_MAP[clasif][sw] = !status;

  res.status(200).json(SENSOR_MAP);
});

module.exports = router;
