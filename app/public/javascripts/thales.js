var app = angular.module('thalesApp', []);

var SWITCHES_PRE = {
  'BP': false,
  'BO': false,
  'E1': false,
  'E2': false,
  'A1': false,
  'A2': false
};
var SWITCHES_POS = {
  'BP': false,
  'BO': false,
  'E1': false,
  'A1': false,
  'A2': false
};


app.controller('SwitchController', function SwitchController($scope) {
  $scope.switches = {
    pre: SWITCHES_PRE,
    pos: SWITCHES_POS
  }
});
