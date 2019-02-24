let ids = ["blue", "yellow", "green", "orange", "darkblue", "pink"];
let letters = ["C", "W", "A", "S", "K", "O"];
let colors = ["#8ccdfc", "#fcf273", "#c2fb73", "#fa8f41", "#1451c4", "#fc73f0"];
let score = 0,
  index = 0,
  keyNum = 4,
  inSession = false;

//sequences for control mode
let mode = "control";
let seq4 = [1, 3, 0, 2, 3, 2, 0, 1, 0, 2];
let seq5 = [1, 3, 4, 0, 2, 3, 2, 4, 1, 4, 2, 1, 0, 3, 4, 3, 0, 1, 2];
let seq6 = [5, 3, 4, 2, 3, 2, 4, 5, 4, 0, 3, 1, 5, 1, 2];

$(document).ready(function() {

  $(document).on('touchstart touchmove mousemove', function(e) {
    if (inSession == false) {
      return;
    }

    e.preventDefault();
    let curColor = $("#header").data("color"); //the current header color
    let targetKey = $("#" + curColor); //the correct key

    //getting the correct key's position
    let left = $(targetKey).position().left,
      top = $(targetKey).position().top;
    let right = left + $(targetKey).width(),
      bottom = top + $(targetKey).height();

    //whether the user touches the correct key
    let touchRightKey = false;
    if (e.type != "mousemove") {
      for (var i = 0; i < e.touches.length; i++) {
        if (e.touches[i].pageX > left && e.touches[i].pageX < right && e.touches[i].pageY > top && e.touches[i].pageY < bottom) {
          touchRightKey = true;
        }
      }
    } else {
      if (e.pageX > left && e.pageX < right && e.pageY > top && e.pageY < bottom) {
        touchRightKey = true;
      }
    }

    //if the user touches the correct key
    if (touchRightKey) {
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
      $("#letter").text(letters[num]);

      //update score
      score++;
      $("#score").text("Score: " + score);

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
    inSession = true;
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
    inSession = false;

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

    //reset index, score and header color
    index = 0;
    score = 0;
    $("#score").text("Score: " + score);
    $("#letter").text("A");
    $("#header").data("color", "green");
    $("#header").css("background-color", "#c2fb73");
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
