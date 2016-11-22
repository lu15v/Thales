var app = angular.module('ManualTest', []);

var PRE_CLA = ['BP', 'BO', 'E1', 'E2', 'A1', 'A2'];
var POS_CLA = ['BP', 'BO', 'E1', 'A1', 'A2'];

app.controller('SimulationController', function SimulationController($scope, $http, $interval) {
  $scope.sensors = {
    pre: PRE_CLA,
    pos: POS_CLA,
  };
  $scope.inputs = {};

  $scope.addSensor = function(clasif, sensor) {
    console.log('adding... ' + clasif + ': ' + sensor);
    var id = clasif.toLowerCase() + '-cla-input';
    var selectize = $('#' + id)[0].selectize;
    selectize.createItem('asdadsad');
  }

  var selects = ["pre-cla-input", "pos-cla-input"];
  selects.forEach(function(input) {
    var control = $('#' + input).selectize({
        plugins: ['drag_drop', 'remove_button'],
        delimiter: ' ',
        persist: false,
        create: function(input) {
          return {
            value: (new Date()).getTime(),
            text: input
          }
        },
        //onFocus: function() {
          //$(this).blur();
        //},
        openOnFocus: false,
        closeAfterSelect: true,
    });
    $scope.inputs[input] = control;
  });


  //$('a.sensor').click(function(event) {
    //var anchor = $(this);
    //var id = anchor.parent().data('activate');
    //var selectize = $('#' + id)[0].selectize;
    //selectize.createItem(anchor.text());
  //});

  //$('a.reset-btn').click(function(event) {
    //var id = $(this).data('reset');
    //var select = $('#' + id)[0].selectize;
    //select.clear();
  //});
});


