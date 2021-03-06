var app = angular.module('BatchTest', []);

var HOST = "10.0.1.14";
var API = "/simulate/";

app.controller('SimulationController', function SimulationController($scope, $http) {
  $scope.batch = {
    'PRE': {},
    'POS': {}
  };
  $scope.loading = false;
  $scope.error   = false;
  $scope.categories = ['1A', '2B', '3C', '4C', '5C', '6C', '7C', '8C', '9C'];
  $scope.colors = [
    'red', 'pink', 'purple',
    'indigo', 'blue', 'light-blue',
    'green', 'light-green', 'lime',
    'yellow', 'amber', 'orange'
  ];

  $scope.categories.forEach(function(el) {
    $scope.batch['PRE'][el] = 0;
    $scope.batch['POS'][el] = 0;
  });

  $scope.icon = function(category) {
    switch (category) {
      case '1A': return 'car';
      case '2B': return 'motorbike';
      default:   return 'truck';
    }
  }

  $scope.simulate = function(clasif) {
    $scope.loading = true;
    $scope.error   = false;

    console.log('Simulating', clasif);
    console.log($scope.batch);
    var data = $scope.batch[clasif];
    $http.post(API + clasif, data)
      .then(function(response) {
        console.log(response);
        $scope.loading = false;
      })
      .catch(function(err) {
        console.log(err);
        $scope.loading = false;
        $scope.error = true;
        $('#modalError').modal('open');
      });
  };

  $('.modal').modal();
});

