let ids = ["blue", "purple", "green", "orange"];
let colors = ["#8ccdfc", "#9e5afb", "#c2fb73", "#fa8f41"];

$(document).ready(function() {
  $(document).mousemove(function(e) {
    let curId = $(e.target).attr('id');
    if (curId == $("#header").data("color")) {
      let randomNum = Math.floor(Math.random() * 4); //generate a random number between 0 and 3
      $("#header").data("color", ids[randomNum]);
      $("#header").css("background-color", colors[randomNum]);
    }
    //console.log($(e.target).attr('id'));
  });
});
