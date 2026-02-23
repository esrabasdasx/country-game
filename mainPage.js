const activeUser = localStorage.getItem("activeUser");
if(!activeUser){
    window.location.href = "login.html";
}

function selectDifficulty(level) {
  localStorage.setItem(
    "gameSettings",
    JSON.stringify({ difficulty: level })
  );

  window.location.href = "game.html";
}