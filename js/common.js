// Side navigation toggle

$(document).on('click', '.sidenav-toggle', function () {
    console.log('sidenav');
    $('.sidenav').toggleClass('active');
  });
  
  // Sticky header
  window.onscroll = function () {
    stickyHeader();
  };
  var header = $('nav');
  var sticky = header.outerHeight(); //offset().top;
  
  function stickyHeader() {
    if (window.pageYOffset > sticky) {
      header.addClass('sticky');
    } else {
      header.removeClass('sticky');
    }
  }
  
  var setCopyYear = function () {
    var date = new Date();
    $('#current-year').html(date.getFullYear());
  };
  
  $(document).ready(function () {
    setCopyYear();
  });
  