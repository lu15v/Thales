var controller = require('./relay-controller');
var Promise    = require('promise');
var board = controller.board;


controller.boardReady.then(function(five, board) {
  controller.simulate3C('PRE');
});
