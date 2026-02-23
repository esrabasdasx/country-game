let gameState = {
  currentQuestion: 0,
  score: 0,
  countries: []
};

window.onload = async function() {

  const settings = JSON.parse(localStorage.getItem("gameSettings"));
  const difficulty = settings?.difficulty || "easy";

  const response = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,capital,population,flags"
  );

  let countries = await response.json();

  countries = filterByDifficulty(countries, difficulty);

  gameState.countries = countries
    .sort(() => 0.5 - Math.random())
    .slice(0, 10);

  showQuestion();
};

function filterByDifficulty(countries, difficulty) {
  if (difficulty === "easy") {
    return countries.filter(c => c.population > 50000000);
  }

  if (difficulty === "medium") {
    return countries.filter(
      c => c.population > 10000000 && c.population <= 50000000
    );
  }

  return countries.filter(c => c.population <= 10000000);
}

function showQuestion() {
  const country = gameState.countries[gameState.currentQuestion];

  document.getElementById("flagImage").src = country.flags.png;
  document.getElementById("questionNumber").innerText =
    `Soru ${gameState.currentQuestion + 1}/10`;
}

function submitAnswer() {
  const correct = gameState.countries[gameState.currentQuestion];

  const countryInput = document.getElementById("countryInput").value.trim();
  const capitalInput = document.getElementById("capitalInput").value.trim();
  const populationInput = parseInt(
    document.getElementById("populationInput").value
  );

  let questionScore = 0;

  if (
    countryInput.toLowerCase() === correct.name.common.toLowerCase()
  ) {
    questionScore += 10;
  }

  if (
    capitalInput.toLowerCase() === correct.capital[0].toLowerCase()
  ) {
    questionScore += 10;
  }

  const tolerance = correct.population * 0.1;
  if (
    Math.abs(correct.population - populationInput) <= tolerance
  ) {
    questionScore += 10;
  }

  gameState.score += questionScore;
  gameState.currentQuestion++;

  if (gameState.currentQuestion >= 10) {
    finishGame();
  } else {
    showQuestion();
  }
}

function finishGame() {
  const activeUser = JSON.parse(localStorage.getItem("activeUser"));
  let users = JSON.parse(localStorage.getItem("users"));

  activeUser.scores.push({
    score: gameState.score,
    difficulty: JSON.parse(localStorage.getItem("gameSettings")).difficulty,
    date: new Date().toISOString()
  });

  users = users.map(u =>
    u.username === activeUser.username ? activeUser : u
  );

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("activeUser", JSON.stringify(activeUser));

  window.location.href = "scoreBoard.html";
}
