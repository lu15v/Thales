var app = angular.module('BatchTest', []);

var API = "http://10.0.1.14:3000/simulate/";

app.controller('SimulationController', function SimulationController($scope, $http) {
  $scope.batch = {
    'PRE': {},
    'POS': {}
  };
  $scope.loading = false;
  $scope.categories = ['1A', '2B', '3C', '4C', '5C', '6C', '7C', '8C', '9C'];
  $scope.colors = [
    'red', 'pink', 'purple',
    'indigo', 'blue', 'light-blue',
    'green', 'light-green', 'lime',
    'yellow', 'amber', 'orange'
  ];

  $scope.categories.forEach(function(el) {
    $scope.batch['PRE'][el] = 1;
    $scope.batch['POS'][el] = 1;
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
    console.log('Simulating', clasif);
    console.log($scope.batch);
    //$http.post(API + clasif + '/' + category)
      //.then(function(response) {
        //console.log(response);
        //$scope.loading = false;
      //});
  }
});

