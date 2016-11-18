var express = require('express');
var router  = express.Router();

var SENSOR_MAP = {
  'BP': 0,
  'BO': 0,
  'E1': 0,
  'E2': 0,
  'A1': 0,
  'A2': 0
};

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


router.post('/signal', function(req, res, next) {
  console.log(req.body);
});

module.exports = router;
