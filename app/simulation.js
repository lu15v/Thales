var controller = require('./relay-controller');
var Promise    = require('promise');
var board      = controller.board;

controller.boardReady.then(function(five, board) {
  //controller.simulate1A('PRE')
    //.then(function () {
      //controller.simulate2B('PRE')
        //.then(function() {
          //controller.simulate3C('PRE')
            //.then(function() {
              //controller.simulate4C('PRE')
            //});
        //});
    //});
  //controller.simulate1A('PRE');
  //controller.simulate2B('PRE');
  controller.simulate3C('POS');
  //controller.simulate4C('PRE');
});
