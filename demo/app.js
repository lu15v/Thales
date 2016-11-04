var switches = [
  "BP",
  "BO",
  "E1",
  "A1"
];

$(function() {
  console.log('IT WORKS');
  var control = $('#input-draggable').selectize({
      plugins: ['drag_drop'],
      delimiter: ',',
      persist: false,
      create: function(input) {
        return {
          value: input,
          text: input
        }
      },
      options: switches.map(function (el) { return { value: el, text: el }})
  });


  $('a.sensor').click(function(event) {
    var selectize = control[0].selectize;
    var value = $(this).text();

    selectize.addItem(value);
  });
});
