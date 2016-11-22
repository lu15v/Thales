var controller = require('./relay-controller');
var Promise    = require('promise');


function start(clasif, sensors) {
  var sensor = sensors.shift();
  controller.open(clasif, sensors);

  if (sensors.length == 0) {
  }
}

function simulate(clasif, sensors) {
  console.log('Simulating ' + clasif + ': ' + sensors);

  var simulation = new Promise(function(resolve, reject) {
    //var error = validate(sensors, clasif);
    //if (error) reject(error);

    controller.open(clasif, 'BO'); // BO
    controller.open(clasif, 'BP'); // BP

    var times = [];

    while (sensors.length > 0) {
      var sensor = sensors.shift();

      controller.open(clasif, sensor);
      //controller.board.wait(controller.GAP_TIME)
      var i = 100000000;
      while (i > 0) i--;
      controller.close(clasif, sensor);

      //(function(sw) {
        //setTimeout(function() {
          //controller.close(clasif, sw);
          //times.pop();
        //}, controller.STD_TIME);
      //})(sensor, times);
    //}

    //while(times.length > 0) {}

    //setTimeout(function() {
    //controller.close(clasif, 'BP');
    //controller.close(clasif, 'BO');
    //}, 7000);

    }
    resolve('DONE');
    controller.close(clasif, 'BO'); // BO
    controller.close(clasif, 'BP'); // BP
  });

  return simulation;
}
function validate(sensors, clasif) {
  var clasif = clasif.toUpperCase();
  if (!(clasif == 'PRE' || clasif == 'POS'))
    return new Error('Invalid clasification, it must be PRE or POS');

  var first = sensors[0].toUpperCase();
  if (first != 'BO')
    return new Error('Invalid sequence of sensors. The simulation should start with a BO');
  if (sensors[1].toUpperCase() != 'BP')
    return new Error('Invalid sequence of sensors. The second element of the ' +
      'simulation should be a BO');

  if (clasif == 'POS') {
    var found = sensors.find(function(sensor) { return sensor === 'E2' });
    if (found) return new Error('POS-CLA cannot have an E2 sensor');
  }

  return false;
}

controller.boardReady.then(function(five, board) {
  console.log('board ready');
  var sim  = ['E1', 'A1', 'A2', 'E1', 'A1', 'A2', 'E1', 'A1', 'A2', 'E1', 'A1', 'A2',];
  var sim2 = ['BP', 'E1', 'E2', 'A1', 'A2'];
  simulate('POS', sim)
    .then(function(res) {
      console.log('Simulation complete');
      console.log(res);
    }, function(error) {
      console.error('ERROR IN THE SIMULATION');
      console.error(error);
    });
});

