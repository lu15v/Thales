var app = angular.module('thalesApp', []);

var SWITCHES = {
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
};

var POLLING_INTERVAL = 5000;
var POLLING;

app.controller('SwitchController', function SwitchController($scope, $http, $interval) {
  $scope.switches = SWITCHES;

  $scope.updateStatus = function () {
    console.log(new Date() + ': Updating status...');
    $http.get('/status')
      .then(function(res) {
        console.log(res);
        $scope.switches = res.data;
      });
  }

  POLLING = $interval($scope.updateStatus, POLLING_INTERVAL);

  $scope.toggle = function(clasif, sw) {
    var val = SWITCHES[clasif][sw];
    console.log('toggling ' + clasif + ': ' + sw + ' => ' + val);

    $http.post('/toggle', {
      sensor: sw,
      clasif: clasif
    }).then(function(response) {
      console.log(response.data);
    });
  };
});
