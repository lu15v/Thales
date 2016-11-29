var app = angular.module('AutoTest', []);

var API = "http://localhost:3000/";

app.controller('SimulationController', function SimulationController($scope, $http) {
  $scope.categories = ['1A', '2B', '3C', '4C', '5C', '6C', '7C', '8C', '9C'];
  $scope.colors = [
    'red', 'pink', 'purple',
    'indigo', 'blue', 'light-blue',
    'green', 'light-green', 'lime',
    'yellow', 'amber', 'orange'
  ];

  $scope.icon = function(category) {
    switch (category) {
      case '1A': return 'car';
      case '2B': return 'motorbike';
      case '3C': return 'truck';
      default:   return 'truck-trailer';
    }
  }

  $scope.simulate = function(clasif, category) {
    console.log('Simulating', clasif, category);
    $http.post(API + clasif + '/' + category,
      function(response) {
        console.log(response);
    });
  }
});

