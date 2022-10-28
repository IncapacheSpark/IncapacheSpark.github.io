$(".panel-heading").parent('.panel').hover(
    function() {
      $(this).children('.collapse').collapse('show');
    }, function() {
      $(this).children('.collapse').collapse('hide');
    }
  );

  
/*
  if($('.collapse').is('.collapse:.show')) {
    nextSibling = $(this).next()
    if (nextSibling != null) {
      $('html, body').animate({
        scrollTop: $(this).closest('.fullcontent').next().offset().top
      }, 1000, 'easeInOutSine');
    }
    else{
      $('.navbar').animate({
        scrollTop: $(this)..offset().top
      }, 1000, 'easeInOutSine');
    }
    

}*/