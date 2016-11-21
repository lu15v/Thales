var five  = require("johnny-five");
var Raspi = require("raspi-io");
var board = new five.Board({
  io: new Raspi()
});

board.on("ready", function() {
  // Create a standard `led` component instance

  // "blink" the led in 500ms
  // on-off phase periods
  rels = five.Relays([0,2,3,4,5,6,21,22,23,25,27]);

  this.repl.inject({
      five: five,
      rels: rels
  });
});
