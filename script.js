var ids = ["green", "blue", "purple", "pink", "yellow", "orange"];
var letters = ["A", "C", "K", "O", "W", "S"];
var allLetters = ["A B C D E", "F G H I J", "K L M N O", "P Q R S T", "U V W X Y Z"];
var colors = ["#c2fb73", "#8ccdfc", "#cb93f9", "#feaab1", "#fcf273", "#fb9e5a"];
var words = ["HI", "LOOK", "I", "CAN", "SPELL", "IT", "IS", "FUN", "AND", "WONDERFUL"];
var score = 0,
  goalScore = 30,
  index = 0,
  letterIndex = 0,
  wordIndex = 0,
  keyNum = 4,
  speed = 1500,
  inSession = false,
  curColor = "",
  curKey = "",
  prevKey = "";
var barTimer, rightKeyTimer, failTimer;

//sequences for letters mode
var mode = "letters";
var seq4 = [2, 3, 1, 0, 3, 0, 1, 2, 1, 0]; //10
var seq5 = [3, 4, 2, 0, 4, 0, 1, 2, 3, 2, 4, 3, 0]; //13
var seq6 = [3, 5, 2, 0, 5, 0, 1, 2, 3, 2, 4, 0, 4, 2, 1, 0]; //16

$(document).ready(function() {

  $(document).on('touchstart touchmove mousemove', function(e) {
    if (inSession == false) {
      return;
    }

    e.preventDefault();
    curColor = $("#header").attr("data-color"); //the current header color
    curKey = getCurKey(e); //the current key

    //spelling mode
    if (mode == "spelling") {
      if (curKey != false && curKey != prevKey) { //user moves to a new key
        if (prevKey != "") {
          resetBar(prevKey);
        }
        prevKey = curKey;
        animateBar(curKey);
      } else if (curKey == false) { //user moves to blank areas
        if (prevKey != "") {
          resetBar(prevKey);
        }
        prevKey = false;
        clearTimeout(barTimer);
        clearTimeout(rightKeyTimer);
      }
    }

    //other modes
    if (mode != "spelling") {
      if (curKey != false && curKey != prevKey) { //user moves to a new key
        prevKey = curKey;
        if (curKey == curColor) { //user moves to the right key
          rightKeyAction();
        }
      } else if (curKey == false) { //user moves to blank areas
        prevKey = false;
      }
    }
  });

  $("#start").on('click', function() {
    $("#start").hide();
    $("#end").show();
    inSession = true;
    mode = $("#mode").val();
    if ($("#speed").val() > 0) {
      speed = $("#speed").val() * 1000;
    } else {
      speed = 1500;
    }

    //posting logs to google sheet
    $.ajax({
      url: "https://script.google.com/macros/s/AKfycbzcjmIPchxdXsJkEfb5S82-t98hwoxo3wNG8RPl16PCx5oOEzs/exec",
      type: "post",
      data: {
        timestamp: $.now(),
        datetime: getDatetime(),
        action: "start",
        data: mode + " " + keyNum + " " + speed
      }
    });
  });

  $("#end").on('click', function() {
    endGame();
  });

  $('#mode').on('change', function(e) {
    //change page layout accordding to the selected mode
    if ($('#mode').val() == "spelling") {
      $('#speedDiv').show();
      $('#keyNumDiv').hide();
      $("#yellow").show();
      $("#orange").hide();
      $(".key").css("width", "30%");
      for (let i = 0; i < 5; i++) {
        $("#" + ids[i] + "> p").text(allLetters[i]);
      }
      constructWord(words[0]);
      $("#header").css("background-color", colors[1]);
      $("#header").attr("data-color", "blue");
      keyNum = 5;
      goalScore = 34;
      $("#score").text("Score: " + 0 + " / " + goalScore);
    } else if ($('#mode').val() == "letters") {
      $('#speedDiv').hide();
      $('#keyNumDiv').show();
      for (let i = 0; i < 6; i++) {
        $("#" + ids[i] + "> p").text(letters[i]);
      }
      adjustKeyNum();
      goalScore = 30;
      $("#score").text("Score: " + 0 + " / " + goalScore);
    }
  });

  $('#keyNum').on('change', function(e) {
    adjustKeyNum();
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

function rightKeyAction() {
  if (mode == "letters") {
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
    $("#header").attr("data-color", ids[num]);
    $("#header").css("background-color", colors[num]);
    $("#letter").text(letters[num]);
  }

  if (mode == "spelling") {
    //move to the next letter or next word
    letterIndex++;
    if (letterIndex >= words[wordIndex].length) {
      wordIndex++;
      letterIndex = 0;
      $("#word").empty();
      constructWord(words[wordIndex]);
    }
    //move the black border
    let letterNum = letterIndex + 1;
    $("#word p:nth-child(" + letterIndex + ")").css("border", "none");
    $("#word p:nth-child(" + letterNum + ")").css("border", "2px solid black");
    //change header color
    let curLetter = words[wordIndex].charAt(letterIndex);
    let groupIndex = getGroupIndex(curLetter);
    $("#header").attr("data-color", ids[groupIndex]);
    $("#header").css("background-color", colors[groupIndex]);
  }

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
      data: curKey
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
  if (curKey == curColor) { //user moves to the right key
    clearTimeout(failTimer);
    rightKeyTimer = setTimeout(rightKeyAction, speed);
  } else {
    clearTimeout(rightKeyTimer);
    failTimer = setTimeout(failLog, speed);
  }
}

function resetBar(id) {
  $("#" + id + "> .bar").stop();
  $("#" + id + "> .bar").css("width", "0%");
  $("#" + id + "> .bar").css("visibility", "hidden");
  if (curKey == prevKey) {
    animateBar(curKey);
  } else {
    clearTimeout(barTimer);
    clearTimeout(failTimer);
  }
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
  clearTimeout(barTimer);
  clearTimeout(rightKeyTimer);
  $("#" + curKey + "> .bar").stop();
  $("#" + curKey + "> .bar").css("width", "0%");
  $("#" + curKey + "> .bar").css("visibility", "hidden");

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
  letterIndex = 0;
  wordIndex = 0;
  score = 0;
  $("#score").text("Score: " + score + " / " + goalScore);
  if (mode == "letters") {
    $("#letter").text("A");
    $("#header").attr("data-color", "green");
    $("#header").css("background-color", "#c2fb73");
  }
  if (mode == "spelling") {
    constructWord(words[0]);
    $("#header").attr("data-color", "blue");
    $("#header").css("background-color", colors[1]);
  }
}

function adjustKeyNum() {
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
  $("#word").empty();
  $("#word").append("<p id='letter'>A</p>");
  $("#header").attr("data-color", "green");
  $("#header").css("background-color", "#c2fb73");
}

function constructWord(word) {
  $("#word").empty();
  for (let i = 0; i < word.length; i++) {
    $("#word").append("<p>" + word.charAt(i) + "</p>");
  }
  $("#word p:nth-child(1)").css("border", "2px solid black");
}

function getGroupIndex(letter) {
  if (letter == 'Z') return 4;
  let num = letter.charCodeAt(0) - ('A').charCodeAt(0);
  return Math.floor(num / 5);
}

function failLog() {
  $.ajax({
    url: "https://script.google.com/macros/s/AKfycbzcjmIPchxdXsJkEfb5S82-t98hwoxo3wNG8RPl16PCx5oOEzs/exec",
    type: "post",
    data: {
      timestamp: $.now(),
      datetime: getDatetime(),
      action: "match fail",
      data: curKey + " " + words[wordIndex].charAt(letterIndex)
    }
  });
}
