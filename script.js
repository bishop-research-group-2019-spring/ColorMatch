var ids = ["green", "blue", "darkblue", "pink", "yellow", "orange"];
var letters = ["A", "C", "K", "O", "W", "S"];
var allLetters = ["A B C D E", "F G H I J", "K L M N O", "P Q R S T", "U V W X Y Z"];
var colors = ["#c2fb73", "#8ccdfc", "#1451c4", "#fc73f0", "#fcf273", "#fa8f41"];
var score = 0,
  goalScore = 30,
  index = 0,
  keyNum = 4,
  inSession = false,
  prevColor = "",
  curColor = "",
  prevKey = "green";
var barTimer, rightKeyTimer, speed, goal;

//sequences for control mode
var mode = "control";
var seq4 = [2, 3, 1, 0, 3, 0, 1, 2, 1, 0]; //10
var seq5 = [3, 4, 2, 0, 4, 0, 1, 2, 3, 2, 4, 3, 0]; //13
var seq6 = [3, 5, 2, 0, 5, 0, 1, 2, 3, 2, 4, 0, 4, 2, 1, 0]; //16

$(document).ready(function() {

  $(document).on('touchstart touchmove mousemove', function(e) {
    if (inSession == false) {
      return;
    }

    e.preventDefault();
    curColor = $("#header").data("color"); //the current header color
    let targetKey = $("#" + curColor); //the correct key
    let curKey = getCurKey(e);

    //spelling mode
    if (mode == "spelling" && curKey != false && curKey != prevKey) {
      resetBar(prevKey);
      prevKey = curKey;
      animateBar(curKey);
      if (curKey == curColor) {
        prevColor = curColor;
        rightKeyTimer = setTimeout(rightKeyAction, speed);
      }
    } else if (mode == "spelling" && curKey == false) {
      resetBar(prevKey);
      prevKey = false;
      clearTimeout(barTimer);
      clearTimeout(rightKeyTimer);
    }

    //if the user touches the correct key
    if (curKey == curColor) {
      if (mode != "spelling") { //other modes
        rightKeyAction();
      }
    }
  });

  $("#start").on('click', function() {
    $("#start").hide();
    $("#end").show();
    inSession = true;
    mode = $("#mode").val();
    speed = $("#speed").val() * 1000;

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
    endGame();
  });

});

$('#mode').on('change', function(e) {
  if ($('#mode').val() == "spelling") {
    $('#speed').show();
    $('#keyNum').hide();
  } else if ($('#mode').val() == "letters") {
    $('#speed').hide();
    $('#keyNum').show();
  }
});

$('#keyNum').on('change', function(e) {
  //change layout accordding to how many keys user want
  keyNum = $("#keyNum").val();
  if (keyNum == 4) {
    $("#yellow").hide();
    $("#orange").hide();
    $(".key").css("width", "43%");
  } else if (keyNum == 5) {
    $("#yellow").show();
    $("#orange").hide();
    $(".key").css("width", "30%");
  } else if (keyNum == 6) {
    $("#yellow").show();
    $("#orange").show();
    $(".key").css("width", "30%");
  }
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

function rightKeyAction() {
  //change header to a new color
  let num = 0;
  if (keyNum == 4) {
    num = seq4[index % (seq4.length)];
  } else if (keyNum == 5) {
    num = seq5[index % (seq5.length)];
  } else if (keyNum == 6) {
    num = seq6[index % (seq6.length)];
  }
  index++;
  $("#header").data("color", ids[num]);
  $("#header").css("background-color", colors[num]);
  $("#letter").text(letters[num]);

  //update score
  score++;
  $("#score").text("Score: " + score + " / " + goalScore);
  if (score == goalScore) {
    alert("Yay you win!");
    endGame();
  }

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

function animateBar(id) {
  $("#" + id + "> .bar").css("visibility", "visible");
  $("#" + id + "> .bar").animate({
    width: "100%"
  }, speed);
  barTimer = setTimeout(function() {
    resetBar(id)
  }, speed + 20);
}

function resetBar(id) {
  $("#" + id + "> .bar").stop();
  $("#" + id + "> .bar").css("width", "0%");
  $("#" + id + "> .bar").css("visibility", "hidden");
}

function getCurKey(e) {
  for (var i = 0; i < keyNum; i++) {
    let left = $("#" + ids[i]).position().left,
      top = $("#" + ids[i]).position().top;
    let right = left + $("#" + ids[i]).width(),
      bottom = top + $("#" + ids[i]).height();

    if (e.type != "mousemove") {
      for (var j = 0; j < e.touches.length; j++) {
        if (e.touches[j].pageX > left && e.touches[j].pageX < right && e.touches[j].pageY > top && e.touches[j].pageY < bottom) {
          return ids[i];
        }
      }
    } else {
      if (e.pageX > left && e.pageX < right && e.pageY > top && e.pageY < bottom) {
        return ids[i];
      }
    }
  }
  return false;
}

function endGame() {
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
  $("#score").text("Score: " + score + " / " + goalScore);
  $("#letter").text("A");
  $("#header").data("color", "green");
  $("#header").css("background-color", "#c2fb73");
}
