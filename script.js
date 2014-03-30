$(document).ready(function() {
  init();
});

function init() {
  // Tooltips
  $('#tooltip').tooltip();

  // Sidebar toggle
  $('.sidebar-toggle').on('click', function() {
    $('.mutio-sidebar').toggle();
    $('.mutio-preview').toggleClass('col-md-9').toggleClass('col-md-12');
  })

  // Reset button
  $('.conf-reset').on('click', function() {
    $('#config').val(null);
  })

}
