let ids = ["blue", "purple", "green", "orange"];
let colors = ["#8ccdfc", "#9e5afb", "#c2fb73", "#fa8f41"];

$(document).ready(function() {

  $(document).on('touchmove', function(e) {
    var touch = e.touches[0];
    let curColor = $("#header").data("color"); //the current header color
    let targetKey = $("#" + curColor); //the correct key

    //getting the correct key's position
    let left = $(targetKey).position().left,
      top = $(targetKey).position().top;
    let right = left + $(targetKey).width(),
      bottom = top + $(targetKey).height();

    //if the user touches the correct key, change header
    if (touch.pageX > left && touch.pageX < right && touch.pageY > top && touch.pageY < bottom) {
      let randomNum = Math.floor(Math.random() * 4); //generate a random number between 0 and 3
      $("#header").data("color", ids[randomNum]);
      $("#header").css("background-color", colors[randomNum]);
    }
  });

});
