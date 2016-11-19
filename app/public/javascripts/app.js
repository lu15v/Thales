$(function() {
  console.log('IT WORKS');

  var selects = ["pre-cla-input", "pos-cla-input"];
  selects.forEach(function(input) {
    var control = $('#' + input).selectize({
        plugins: ['drag_drop', 'remove_button'],
        delimiter: ' ',
        persist: false,
        create: function(input) {
          return {
            value: input + '_' + (new Date()).getTime(),
            text: input
          }
        },
        onFocus: function() {
          $(this).blur();
        },
        openOnFocus: false,
        closeAfterSelect: true,
    });
  });


  $('a.sensor').click(function(event) {
    var anchor = $(this);
    var id = anchor.parent().data('activate');
    var selectize = $('#' + id)[0].selectize;
    selectize.createItem(anchor.text());
  });

  $('a.reset-btn').click(function(event) {
    var id = $(this).data('reset');
    var select = $('#' + id)[0].selectize;
    select.clear();
  });
});

