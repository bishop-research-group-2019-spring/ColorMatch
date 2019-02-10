let ids = ["blue", "purple", "green", "orange", "darkblue", "pink"];
let colors = ["#8ccdfc", "#9e5afb", "#c2fb73", "#fa8f41", "#1451c4", "#fc73f0"];
let score = 0,
  keyNum = 4;

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

    //if the user touches the correct key
    if (touch.pageX > left && touch.pageX < right && touch.pageY > top && touch.pageY < bottom) {
      //change header to a new color
      let randomNum = Math.floor(Math.random() * keyNum); //generate a random number between 0 and the number of keys
      while (ids[randomNum] == curColor) {
        randomNum = Math.floor(Math.random() * keyNum); //generate again if it's the same as the current color
      }
      $("#header").data("color", ids[randomNum]);
      $("#header").css("background-color", colors[randomNum]);

      //update score
      score++;
      $("#score").text(score + "");

      //posting logs to google sheet
      $.ajax({
        url: "https://script.google.com/macros/s/AKfycbzcjmIPchxdXsJkEfb5S82-t98hwoxo3wNG8RPl16PCx5oOEzs/exec",
        type: "post",
        data: {
          timestamp: $.now(),
          datetime: getDatetime(),
          action: "match success",
          data: curColor
        }
      });
    }
  });

  $("#start").on('click', function() {
    $("#start").hide();
    $("#end").show();

    score = 0;
    $("#score").text(score + "");

    //change layout accordding to how many keys user want
    keyNum = $("#keyNum").val();
    if (keyNum == 4) {
      $("#darkblue").hide();
      $("#pink").hide();
      $(".key").css("width", "43%");
    } else if (keyNum == 5) {
      $("#darkblue").show();
      $("#pink").hide();
      $(".key").css("width", "30%");
    } else if (keyNum == 6) {
      $("#darkblue").show();
      $("#pink").show();
      $(".key").css("width", "30%");
    }

    //posting logs to google sheet
    $.ajax({
      url: "https://script.google.com/macros/s/AKfycbzcjmIPchxdXsJkEfb5S82-t98hwoxo3wNG8RPl16PCx5oOEzs/exec",
      type: "post",
      data: {
        timestamp: $.now(),
        datetime: getDatetime(),
        action: "start",
        data: keyNum
      }
    });
  });

  $("#end").on('click', function() {
    $("#end").hide();
    $("#start").show();

    //posting logs to google sheet
    $.ajax({
      url: "https://script.google.com/macros/s/AKfycbzcjmIPchxdXsJkEfb5S82-t98hwoxo3wNG8RPl16PCx5oOEzs/exec",
      type: "post",
      data: {
        timestamp: $.now(),
        datetime: getDatetime(),
        action: "end",
        data: score
      }
    });
  });

});

function getDatetime() {
  let currentdate = new Date();
  let datetime = currentdate.getDate() + "/" +
    (currentdate.getMonth() + 1) + "/" +
    currentdate.getFullYear() + " " +
    currentdate.getHours() + ":" +
    currentdate.getMinutes() + ":" +
    currentdate.getSeconds();
  return datetime;
}
