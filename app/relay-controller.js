var util    = require('util');
var Promise = require('promise');
var five    = require('johnny-five');
//var raspi   = require('raspi-io');

/**
 * GAP_TIME and STD_TIME gets multiplied
 * by this factor in order to increase/decrease
 * the amount of time.
 */
var FACTOR     = 1;
/**
 * Time between each signal.
 * @constant
 * @default
 */
var GAP_TIME   = 50 * FACTOR;
/**
 * Time that the signal will be UP/HIGH.
 * @constant
 * @default
 */
var STD_TIME   = 100 * FACTOR;
/**
 * Status of each sensor.
 * @constant
 * @default
 */
var SENSOR_MAP = {
  pre: {
    'BP': false,
    'BP2': false,
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
/**
 * Pinout mapping of the Raspberry Pins
 * The key indicates the sensor and the {integer} value
 * represents the Wiring Pi PIN number.
 * For more information check this link:
 * http://wiringpi.com/pins/ or http://pinout.xyz/
 * and look for the section WiringPi Pin
 */
var PIN_MAP = {
  pre: {
    'BP': 0,
    'BP2': 7,
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
    'BP2': null,
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
  //io: new raspi(),
  repl: false,
  debug: false
});
/**
 * Promise that gets resolved when the Raspberry Pi is
 * properly initialized with all the sensors mapped to the
 * pins.
 * At the begining, every sensor is OFF/LOW
 *
 * @param resolve - resolve(five, board)
 * @param reject - reject()
 * @returns {Promise} promise(resolve, reject)
 */
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


/**
 * Simulates the crossing of a vehicle's single axle.
 * This is useful to group the following sequence of signals:
 * For POS: E1, A1, A2
 * For PRE: E1-E2, A1, A2
 *
 * @param clasif - 'PRE' or 'POS'
 * @returns {Promise} - promise(resolve, reject)
 */
function singleAxle(clasif) {
  if (clasif === undefined) throw ArgumentException(arguments);

  var wait = board.wait;

  console.log('> SINGLE AXLE');

  return new Promise(function(resolve, reject) {
    var s = function(sensor) {
      return signal(clasif, sensor);
    }

    var ss = function(sensor1, sensor2) { return overlapSignal(clasif, sensor1, sensor2); }

    if (clasif == 'POS') {
      s('E1')
        .then(function () { return s('A1') })
        .then(function () { return s('A2') })
        .then(function() {
          console.log('< SINGLE AXLE');
          resolve();
        });
    } else if (clasif == 'PRE') {
      ss('E1', 'E2')
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
/**
 * Simulates the crossing of a vehicle's double axle.
 * This is useful to group the following sequence of signals:
 * For POS: E1, A1-A2
 * For PRE: E1E2, A1-A2
 *
 * @param clasif - 'PRE' or 'POS'
 * @returns {Promise} - promise(resolve, reject)
 */
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

/**
 * Simulate sending a signal from a sensor. This means
 * start sending the signal and after {STD_TIME} stop
 * sending it. After that there is a WAIT TIME of {GAP_TIME}
 *
 * @param clasif
 * @param sensor
 * @returns {Promise} - promise(resolve, reject)
 */
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
/**
 * Simulate sending a signal overlapped from two sensors. This means
 * start sending the signal and right after waiting GAP_TIME, start
 * sending the second signal at the same time. After {STD_TIME} both
 * signals stop sending at the same time and after that there is
 * a WAIT TIME of {GAP_TIME}
 *
 * @param clasif
 * @param sensor
 * @returns {Promise} - promise(resolve, reject)
 */
function overlapSignal(clasif, sensor1, sensor2) {
  return new Promise(function(resolve, reject) {
    open(clasif, sensor1);
    board.wait(GAP_TIME, function() {
      open(clasif, sensor2);
      board.wait(STD_TIME, function() {
        close(clasif, sensor1);
        close(clasif, sensor2);

        board.wait(GAP_TIME, function() {
          resolve();
        });
      });
    });
  });
}

/**
 * Simulate the crossing of a 1A vehicle. This means sending the
 * following signals:
 * For POS:
 *    OPEN BO
 *    OPEN BP
 *
 *    E1
 *    A1
 *    A2
 *
 *    CLOSE BO
 *    CLOSE BP
 * For PRE:
 *    OPEN BO
 *    OPEN BP
 *
 *    E1-E2
 *    A1
 *    A2
 *
 *    CLOSE BO
 *    CLOSE BP
 *
 * @param clasif
 * @returns {Promise} - promise(resolve, reject)
 */
function simulate1A(clasif) {
  return new Promise(function(resolve, reject) {
    var wait   = board.wait;
    var single = function() { return singleAxle(clasif); }

    open(clasif, 'BO');
    wait(GAP_TIME, function() {
      open(clasif, 'BP');
      single()
        .then(single)
        .then(function() {
          close(clasif, 'BP');
          close(clasif, 'BO');
          wait(STD_TIME * 4, function() {
            resolve();
          });
        });
    });
  });
}
/**
 * Simulate the crossing of a 2B/2C vehicle. This means sending the
 * following signals:
 * For POS:
 *    OPEN BO
 *    OPEN BP
 *    E1
 *    A1
 *    A2
 *
 *    E1
 *    A1-A2
 *
 *    CLOSE BO
 *    CLOSE BP
 * For PRE:
 *    OPEN BO
 *    OPEN BP
 *    E1-E2
 *    A1
 *    A2
 *
 *    E1-E2
 *    A1-A2
 *
 *    CLOSE BO
 *    CLOSE BP
 *
 * @param clasif
 * @returns {Promise} - promise(resolve, reject)
 */
function simulate2B(clasif) {
  return new Promise(function(resolve, reject) {
    var wait   = board.wait;
    var single = function() { return singleAxle(clasif); }
    var double = function() { return doubleAxle(clasif); }

    open(clasif, 'BO');
    wait(GAP_TIME, function() {
      open(clasif, 'BP');
      single()
        .then(double)
        .then(function() {
          close(clasif, 'BP');
          close(clasif, 'BO');
          wait(STD_TIME * 4, function() {
            resolve();
          });
        });
    });
  });
}
/**
 * Simulate the crossing of a 3C vehicle. This means sending the
 * following signals:
 * For POS:
 *    OPEN BO
 *    OPEN BP
 *    E1
 *    A1
 *    A2
 *
 *    E1    <-- This gets repeated
 *    A1-A2 <-- two times
 *
 *    CLOSE BO
 *    CLOSE BP
 * For PRE:
 *    OPEN BO
 *    OPEN BP
 *    E1-E2
 *    A1
 *    A2
 *
 *    E1-E2 <-- This gets repeated
 *    A1-A2 <-- two times
 *
 *    CLOSE BO
 *    CLOSE BP
 *
 * @param clasif
 * @returns {Promise} - promise(resolve, reject)
 */
function simulate3C(clasif) {
  return new Promise(function(resolve, reject) {
    var wait   = board.wait;
    var single = function() { return singleAxle(clasif); }
    var double = function() { return doubleAxle(clasif); }

    open(clasif, 'BO');
    wait(GAP_TIME, function() {
      open(clasif, 'BP');
      single()
        .then(double)
        .then(double) // 3C
        .then(function() {
          close(clasif, 'BP');
          close(clasif, 'BO');
          wait(STD_TIME * 4, function() {
            resolve();
          });
        });
    });
  });
}

/**
 * Simulate the crossing of a 4C vehicle. This means sending the
 * following signals:
 * For POS:
 *    OPEN BO
 *    OPEN BP
 *    E1
 *    A1
 *    A2
 *
 *    E1    <-- This gets repeated
 *    A1-A2 <-- three times
 *
 *    CLOSE BO
 *    CLOSE BP
 * For PRE:
 *    OPEN BO
 *    OPEN BP
 *    E1-E2
 *    A1
 *    A2
 *
 *    E1-E2 <-- This gets repeated
 *    A1-A2 <-- three times
 *
 *    CLOSE BO
 *    CLOSE BP
 *
 * @param clasif
 * @returns {Promise} - promise(resolve, reject)
 */
function simulate4C(clasif) {
  return new Promise(function(resolve, reject) {
    var wait   = board.wait;
    var single = function() { return singleAxle(clasif); }
    var double = function() { return doubleAxle(clasif); }

    open(clasif, 'BO');
    wait(GAP_TIME, function() {
      open(clasif, 'BP');
      single()
        .then(double)
        .then(double) // 3C
        .then(double) // 4C
        .then(function() {
          close(clasif, 'BP');
          close(clasif, 'BO');
          wait(STD_TIME * 4, function() {
            resolve();
          });
        });
    });
  });
}

/**
 * Simulate the crossing of a 5C vehicle. This means sending the
 * following signals:
 * For POS:
 *    OPEN BO
 *    OPEN BP
 *    E1
 *    A1
 *    A2
 *
 *    E1    <-- This gets repeated
 *    A1-A2 <-- four times
 *
 *    CLOSE BO
 *    CLOSE BP
 * For PRE:
 *    OPEN BO
 *    OPEN BP
 *    E1-E2
 *    A1
 *    A2
 *
 *    E1-E2 <-- This gets repeated
 *    A1-A2 <-- four times
 *
 *    CLOSE BO
 *    CLOSE BP
 *
 * @param clasif
 * @returns {Promise} - promise(resolve, reject)
 */
function simulate5C(clasif) {
  return new Promise(function(resolve, reject) {
    var wait   = board.wait;
    var single = function() { return singleAxle(clasif); }
    var double = function() { return doubleAxle(clasif); }

    open(clasif, 'BO');
    wait(GAP_TIME, function() {
      open(clasif, 'BP');
      single()
        .then(double)
        .then(double) // 3C
        .then(double) // 4C
        .then(double) // 5C
        .then(function() {
          close(clasif, 'BP');
          close(clasif, 'BO');
          wait(STD_TIME * 4, function() {
            resolve();
          });
        });
    });
  });
}

/**
 * Simulate the crossing of a 6C vehicle. This means sending the
 * following signals:
 * For POS:
 *    OPEN BO
 *    OPEN BP
 *    E1
 *    A1
 *    A2
 *
 *    E1    <-- This gets repeated
 *    A1-A2 <-- five times
 *
 *    CLOSE BO
 *    CLOSE BP
 * For PRE:
 *    OPEN BO
 *    OPEN BP
 *    E1-E2
 *    A1
 *    A2
 *
 *    E1-E2 <-- This gets repeated
 *    A1-A2 <-- five times
 *
 *    CLOSE BO
 *    CLOSE BP
 *
 * @param clasif
 * @returns {Promise} - promise(resolve, reject)
 */
function simulate6C(clasif) {
  return new Promise(function(resolve, reject) {
    var wait   = board.wait;
    var single = function() { return singleAxle(clasif); }
    var double = function() { return doubleAxle(clasif); }

    open(clasif, 'BO');
    wait(GAP_TIME, function() {
      open(clasif, 'BP');
      single()
        .then(double)
        .then(double) // 3C
        .then(double) // 4C
        .then(double) // 5C
        .then(double) // 6C
        .then(function() {
          close(clasif, 'BP');
          close(clasif, 'BO');
          wait(STD_TIME * 4, function() {
            resolve();
          });
        });
    });
  });
}

/**
 * Simulate the crossing of a 7C vehicle. This means sending the
 * following signals:
 * For POS:
 *    OPEN BO
 *    OPEN BP
 *    E1
 *    A1
 *    A2
 *
 *    E1    <-- This gets repeated
 *    A1-A2 <-- six times
 *
 *    CLOSE BO
 *    CLOSE BP
 * For PRE:
 *    OPEN BO
 *    OPEN BP
 *    E1-E2
 *    A1
 *    A2
 *
 *    E1-E2 <-- This gets repeated
 *    A1-A2 <-- six times
 *
 *    CLOSE BO
 *    CLOSE BP
 *
 * @param clasif
 * @returns {Promise} - promise(resolve, reject)
 */
function simulate7C(clasif) {
  return new Promise(function(resolve, reject) {
    var wait   = board.wait;
    var single = function() { return singleAxle(clasif); }
    var double = function() { return doubleAxle(clasif); }

    open(clasif, 'BO');
    wait(GAP_TIME, function() {
      open(clasif, 'BP');
      single()
        .then(double)
        .then(double) // 3C
        .then(double) // 4C
        .then(double) // 5C
        .then(double) // 6C
        .then(double) // 7C
        .then(function() {
          close(clasif, 'BP');
          close(clasif, 'BO');
          //resolve();
          wait(STD_TIME * 4, function() {
            resolve();
          });
        });
    });
  });
}

/**
 * Simulate the crossing of a 8C vehicle. This means sending the
 * following signals:
 * For POS:
 *    OPEN BO
 *    OPEN BP
 *    E1
 *    A1
 *    A2
 *
 *    E1    <-- This gets repeated
 *    A1-A2 <-- seven times
 *
 *    CLOSE BO
 *    CLOSE BP
 * For PRE:
 *    OPEN BO
 *    OPEN BP
 *    E1-E2
 *    A1
 *    A2
 *
 *    E1-E2 <-- This gets repeated
 *    A1-A2 <-- seven times
 *
 *    CLOSE BO
 *    CLOSE BP
 *
 * @param clasif
 * @returns {Promise} - promise(resolve, reject)
 */
function simulate8C(clasif) {
  return new Promise(function(resolve, reject) {
    var wait   = board.wait;
    var single = function() { return singleAxle(clasif); }
    var double = function() { return doubleAxle(clasif); }

    open(clasif, 'BO');
    wait(GAP_TIME, function() {
      open(clasif, 'BP');
      single()
        .then(double)
        .then(double) // 3C
        .then(double) // 4C
        .then(double) // 5C
        .then(double) // 6C
        .then(double) // 7C
        .then(double) // 8C
        .then(function() {
          close(clasif, 'BP');
          close(clasif, 'BO');
          wait(STD_TIME * 4, function() {
            resolve();
          });
        });
    });
  });
}

/**
 * Simulate the crossing of a 8C vehicle. This means sending the
 * following signals:
 * For POS:
 *    OPEN BO
 *    OPEN BP
 *    E1
 *    A1
 *    A2
 *
 *    E1    <-- This gets repeated
 *    A1-A2 <-- eight times
 *
 *    CLOSE BO
 *    CLOSE BP
 * For PRE:
 *    OPEN BO
 *    OPEN BP
 *    E1-E2
 *    A1
 *    A2
 *
 *    E1-E2 <-- This gets repeated
 *    A1-A2 <-- eight times
 *
 *    CLOSE BO
 *    CLOSE BP
 *
 * @param clasif
 * @returns {Promise} - promise(resolve, reject)
 */
function simulate9C(clasif) {
  return new Promise(function(resolve, reject) {
    var wait   = board.wait;
    var single = function() { return singleAxle(clasif); }
    var double = function() { return doubleAxle(clasif); }

    open(clasif, 'BO');
    wait(GAP_TIME, function() {
      open(clasif, 'BP');
      single()
        .then(double)
        .then(double) // 3C
        .then(double) // 4C
        .then(double) // 5C
        .then(double) // 6C
        .then(double) // 7C
        .then(double) // 8C
        .then(double) // 9C
        .then(function() {
          close(clasif, 'BP');
          close(clasif, 'BO');
          wait(STD_TIME * 4, function() {
            resolve();
          });
        });
    });
  });
}
/**
 * Switches between ON/OFF of a specific sensor.
 *
 * @param clasif - 'PRE' or 'POS'
 * @param {string} sensor - Name of the sensor:
 * it must be one value of the SENSORS list.
 * @returns {undefined}
 */
function toggleSensor(clasif, sensor) {
  var status = SENSOR_MAP[clasif][sensor];
  var relay  = RELAYS[clasif][sensor];

  relay.toggle();
  SENSOR_MAP[clasif][sensor] = !status;
}
/**
 * Toggles the state of every sensor. If it was sending
 * a signal, then it stops sending it.
 * If it was not sending a signal, it starts sending a signal.
 */
function toggleAll() {
  for (var clasif in SENSOR_MAP) {
    for (var sensor in SENSOR_MAP[clasif]) {
      toggleSensor(clasif, sensor);
    }
  }
}
/**
 * Closes the RELAY so any signal that was being sent through
 * the PIN, gets interrupted.
 *
 * @param {string} clasif - It must be either 'PRE' or 'POS'
 * @param {string} sensor - The sensor you want to simulate:
 * it must be one value of the SENSORS list.
 * @returns {boolean} - true if the relay was open correctly,
 * false otherwise.
 *
 * @throws {ArgumentException} If you don't send both parameters
 */
function close(clasif, sensor) {
  if (arguments.length != 2) throw ArgumentException(arguments);

  var clasif = clasif.toLowerCase();
  var status = SENSOR_MAP[clasif][sensor];
  var relay  = RELAYS[clasif][sensor];

  console.log('Closing ' + clasif + ': ' + sensor + '...');
  relay.close();
  SENSOR_MAP[clasif][sensor] = false;
}
/**
 * Opens the RELAY so a signal is sent and it keeps sending
 * such signal until you *manually* close the RELAY with the
 * close function.
 *
 * @param {string} clasif - It must be either 'PRE' or 'POS'
 * @param {string} sensor - The sensor you want to simulate:
 * it must be one value of the SENSORS list.
 * @returns {boolean} - true if the relay was open correctly,
 * false otherwise.
 *
 * @throws {ArgumentException} If you don't send both parameters
 */
function open(clasif, sensor) {
  if (arguments.length != 2) throw ArgumentException(arguments);

  var clasif = clasif.toLowerCase();
  var status = SENSOR_MAP[clasif][sensor];
  var relay  = RELAYS[clasif][sensor];

  console.log('Opening ' + clasif + ': ' + sensor + '...');
  relay.open();
  SENSOR_MAP[clasif][sensor] = true;

  return true;
}
function ArgumentException(arguments) {
  var args = util.inspect(arguments);
  return new Error("Invalid arguments: " + args);
}

module.exports = {
  five:         five,
  board:        board,
  boardReady:   boardReady,
  close:        close,
  open:         open,
  toggleAll:    toggleAll,
  toggleSensor: toggleSensor,
  singleAxle:   singleAxle,
  doubleAxle:   doubleAxle,

  simulate1A:   simulate1A,
  simulate2B:   simulate2B,
  simulate3C:   simulate3C,
  simulate4C:   simulate4C,
  simulate5C:   simulate5C,
  simulate6C:   simulate6C,
  simulate7C:   simulate7C,
  simulate8C:   simulate8C,
  simulate9C:   simulate9C,

  SENSOR_MAP:   SENSOR_MAP,
  GAP_TIME:     GAP_TIME,
  STD_TIME:     STD_TIME
}
