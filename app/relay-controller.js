var util    = require('util');
var Promise = require('promise');
var five    = require('johnny-five');
var raspi   = require('raspi-io');

/**
 * GLOBAL VARS
 **/
var GAP_TIME   = 50;
var STD_TIME   = 100;
var IS_READY   = false;
var SENSOR_MAP = {
  pre: {
    'BP': false,
    'BO': false,
    'E1': false,
    'E2': false,
    'A1': false,
    'A2': false,
  },
  pos: {
    'BP': false,
    'BO': false,
    'E1': false,
    'A1': false,
    'A2': false,
  },
};
var PIN_MAP = {
  pre: {
    'BP': 0,
    'BO': 2,
    'E1': 3,
    'E2': 4,
    'A1': 5,
    'A2': 6,
  },
  pos: {
    'BP': 21,
    'BO': 22,
    'E1': 23,
    'A1': 25,
    'A2': 27,
  },
};
var RELAYS = {
  pre: {
    'BP': null,
    'BO': null,
    'E1': null,
    'E2': null,
    'A1': null,
    'A2': null,
  },
  pos: {
    'BP': null,
    'BO': null,
    'E1': null,
    'A1': null,
    'A2': null,
  },
};

/**
 * BOARD EVENTS
 **/
var board = new five.Board({
  io: new raspi(),
  repl: false,
  debug: false
});
var boardReady = new Promise(function(resolve, reject) {
  board.on('ready', function() {
    console.log('*** RELAY  INIT ***');
    // Initialize RELAYS
    for (var clasif in SENSOR_MAP) {
      var val = SENSOR_MAP[clasif];
      for (var sensor in val) {
        var pin = PIN_MAP[clasif][sensor];
        var relay = new five.Relay(pin);
        relay.close();
        RELAYS[clasif][sensor] = relay;
        var msg = util.format('Initializing Relay on PIN %s for sensor %s[%s]...',
          pin, clasif, sensor);
        console.log(msg);
      }
    }
    console.log('* * * * * * * * * *');
    resolve(five, board);
  });
});


function singleAxle() {
  var promise = new Promise(function(resolve, reject) {
    var wait = board.wait;
    open('E1');
    wait(STD_TIME, function() {
      close('E1');
      wait(GAP_TIME, function() {
        open('A1');
        wait(STD_TIME, function() {
          close('A1');
          wait(GAP_TIME, function() {
            open('A2');
            wait(STD_TIME, function() {
              close('A2');
              resolve();
            });
          });
        });
      });
    });
  });
  return promise;
}

function doubleAxle() {
  var promise = new Promise(function(resolve, reject) {
    var wait = board.wait;
    open('E1');
    wait(STD_TIME, function() {
      close('E1');
      wait(GAP_TIME, function() {
        open('A1');
        open('A2');
        wait(STD_TIME, function() {
          close('A1');
          close('A2');
          resolve();
        });
      });
    });
  });
  return promise;
}

function toggleSensor(clasif, sensor) {
  var status = SENSOR_MAP[clasif][sensor];
  var relay  = RELAYS[clasif][sensor];

  relay.toggle();
  SENSOR_MAP[clasif][sensor] = !status;
}
function toggleAll() {
  for (var clasif in SENSOR_MAP) {
    for (var sensor in SENSOR_MAP[clasif]) {
      toggleSensor(clasif, sensor);
    }
  }
}

module.exports = {
  toggleSensor: toggleSensor,
  toggleAll: toggleAll,
  SENSOR_MAP: SENSOR_MAP,
  board: board,
  five: five,
  boardReady: boardReady,
  singleAxle: singleAxle
}
