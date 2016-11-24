var util    = require('util');
var Promise = require('promise');
var five    = require('johnny-five');
var raspi   = require('raspi-io');

/**
 * GLOBAL VARS
 **/
var FACTOR     = 3;
var GAP_TIME   = 50 * FACTOR;
var STD_TIME   = 100 * FACTOR;
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


function singleAxle(clasif) {
  if (clasif === undefined) throw ArgumentException(arguments);

  var wait = board.wait;

  console.log('> SINGLE AXLE');

  return new Promise(function(resolve, reject) {
    var s = function(sensor) {
      return signal(clasif, sensor);
    }

    if (clasif == 'POS') {
      s('E1')
        .then(function () { return s('A1') })
        .then(function () { return s('A2') })
        .then(function() {
          console.log('< SINGLE AXLE');
          resolve();
        });
    } else if (clasif == 'PRE') {
      s('E1')
        .then(function () { return s('E2') })
        .then(function () { return s('A1') })
        .then(function () { return s('A2') })
        .then(function() {
          console.log('< SINGLE AXLE');
          resolve();
        });
    } else {
      throw ArgumentException(arguments);
    }
  });
}
function doubleAxle(clasif) {
  if (clasif === undefined) throw ArgumentException(arguments);

  var wait = board.wait;

  console.log('> DOUBLE AXLE');

  return new Promise(function(resolve, reject) {
    var s = function(sensor) {
      return signal(clasif, sensor);
    }
    var ss = function(sensor1, sensor2) {
      return overlapSignal(clasif, sensor1, sensor2);
    }

    if (clasif == 'POS') {
      s('E1')
        .then(function () { return ss('A1', 'A2') })
        .then(function() {
          console.log('< DOUBLE AXLE');
          resolve();
        });
    } else if (clasif == 'PRE') {
      ss('E1', 'E2')
        .then(function () { return ss('A1', 'A2') })
        .then(function() {
          console.log('< DOUBLE AXLE');
          resolve();
        });
    } else {
      throw ArgumentException(arguments);
    }
  });
}

function signal(clasif, sensor) {
  return new Promise(function(resolve, reject) {
    open(clasif, sensor);
    board.wait(STD_TIME, function() {
      close(clasif, sensor);

      board.wait(GAP_TIME, function() {
        resolve();
      });
    });
  });
}
function overlapSignal(clasif, sensor1, sensor2) {
  return new Promise(function(resolve, reject) {
    open(clasif, sensor1);
    open(clasif, sensor2);
    board.wait(STD_TIME, function() {
      close(clasif, sensor1);
      close(clasif, sensor2);

      board.wait(GAP_TIME, function() {
        resolve();
      });
    });
  });
}

function simulate1A(clasif) {
  var wait = board.wait;

  var single = function() {
    return singleAxle(clasif);
  }

  open(clasif, 'BO');
  wait(GAP_TIME, function() {
    open(clasif, 'BP');
    single()
      .then(single)
      .then(function() {
        close(clasif, 'BP');
        close(clasif, 'BO');
      });
  });
}
function simulate2B(clasif) {
  var wait = board.wait;

  var single = function() {
    return singleAxle(clasif);
  }
  var double = function() {
    return doubleAxle(clasif);
  }

  open(clasif, 'BO');
  wait(GAP_TIME, function() {
    open(clasif, 'BP');
    single()
      .then(double)
      .then(function() {
        close(clasif, 'BP');
        close(clasif, 'BO');
      });
  });
}
function simulate3C(clasif) {
  var wait = board.wait;

  var single = function() {
    return singleAxle(clasif);
  }
  var double = function() {
    return doubleAxle(clasif);
  }

  open(clasif, 'BO');
  wait(GAP_TIME, function() {
    open(clasif, 'BP');
    single()
      .then(double)
      .then(double)
      .then(function() {
        close(clasif, 'BP');
        close(clasif, 'BO');
      });
  });
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
function close(clasif, sensor) {
  if (arguments.length != 2) throw ArgumentException(arguments);

  var clasif = clasif.toLowerCase();
  var status = SENSOR_MAP[clasif][sensor];
  var relay  = RELAYS[clasif][sensor];

  console.log('Closing ' + clasif + ': ' + sensor + '...');
  relay.close();
  SENSOR_MAP[clasif][sensor] = false;
}
function open(clasif, sensor) {
  if (arguments.length != 2) throw ArgumentException(arguments);

  var clasif = clasif.toLowerCase();
  var status = SENSOR_MAP[clasif][sensor];
  var relay  = RELAYS[clasif][sensor];

  console.log('Opening ' + clasif + ': ' + sensor + '...');
  relay.open();
  SENSOR_MAP[clasif][sensor] = true;
}
function ArgumentException(arguments) {
  var args = util.inspect(arguments);
  return new Error("Invalid arguments: " + args);
}

module.exports = {
  toggleSensor: toggleSensor,
  toggleAll: toggleAll,
  close: close,
  open: open,
  SENSOR_MAP: SENSOR_MAP,
  board: board,
  five: five,
  boardReady: boardReady,
  singleAxle: singleAxle,
  doubleAxle: doubleAxle,
  simulate1A: simulate1A,
  simulate2B: simulate2B,
  simulate3C: simulate3C,
  GAP_TIME: GAP_TIME,
  STD_TIME: STD_TIME
}
