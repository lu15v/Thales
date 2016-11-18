var five  = require("johnny-five");
var Raspi = require("raspi-io");
var board = new five.Board({
  io: new Raspi()
});

board.on("ready", function() {
  // Create a standard `led` component instance
  var led = new five.Led(2);

  // "blink" the led in 500ms
  // on-off phase periods
  this.repl.inject({
      led: led,
      five: five
  });
});
