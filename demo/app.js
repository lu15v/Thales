var switches = [
  "BP",
  "BO",
  "E1",
  "A1"
];
var counter = 0;

$(function() {
  console.log('IT WORKS');
  var control = $('#input-draggable').selectize({
      plugins: ['drag_drop', 'remove_button'],
      delimiter: ' ',
      persist: false,
      create: function(input) {
        console.log('creating', input);
        return {
          value: counter++,
          text: input
        }
      },
      onFocus: function() {
        console.log('focused');
        $(this).blur();
      },
      openOnFocus: false,
      closeAfterSelect: true,
  });


  $('a.sensor').click(function(event) {
    var selectize = control[0].selectize;
    var value = $(this).text();


    selectize.createItem(value);
  });
});
