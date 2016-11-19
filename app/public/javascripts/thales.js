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

app.controller('SwitchController', function SwitchController($scope, $http) {
  $scope.switches = SWITCHES;

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
