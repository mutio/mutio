$( document ).ready(function() {
  $('#tooltip').tooltip();

  // Hide button
  $('.sidebar-toggle').on('click', function() {
    $('.mutio-sidebar').toggle();
    $('.mutio-preview').toggleClass('col-md-9').toggleClass('col-md-12');
  })

});
