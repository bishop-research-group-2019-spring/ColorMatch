let ids = ["blue", "yellow", "green", "orange", "darkblue", "pink"];
let colors = ["#8ccdfc", "#fcf273", "#c2fb73", "#fa8f41", "#1451c4", "#fc73f0"];
let score = 0,
  index = 0,
  keyNum = 4;

//sequences for control mode
let mode = "control";
let seq4 = [1, 3, 0, 2, 3, 2, 0, 1, 0, 2];
let seq5 = [1, 3, 4, 0, 2, 3, 2, 4, 1, 4, 2, 1, 0, 3, 4, 3, 0, 1, 2];
let seq6 = [5, 3, 4, 2, 3, 2, 0, 4, 5, 4, 0, 3, 0, 5, 0, 2];

$(document).ready(function() {

  $(document).on('touchmove', function(e) {
    e.preventDefault();
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
      let num = 0;
      if (mode == "random") {
        num = Math.floor(Math.random() * keyNum); //generate a random number between 0 and the number of keys
        while (ids[num] == curColor) {
          num = Math.floor(Math.random() * keyNum); //generate again if it's the same as the current color
        }
      } else {
        if (keyNum == 4) {
          num = seq4[index % (seq4.length)];
        } else if (keyNum == 5) {
          num = seq5[index % (seq5.length)];
        } else if (keyNum == 6) {
          num = seq6[index % (seq6.length)];
        }
        index++;
      }
      $("#header").data("color", ids[num]);
      $("#header").css("background-color", colors[num]);

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

    //reset index, score and header color
    index = 0;
    score = 0;
    $("#score").text(score + "");
    $("#header").data("color", "green");
    $("#header").css("background-color", "#c2fb73");

    mode = $("#mode").val();

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
        data: keyNum + " " + mode
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
