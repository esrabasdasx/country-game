
let gameState = {
  currentQuestion: 0,
  score: 0,
  countries: []
};


window.onload = async function() {
  const activeUser = JSON.parse(localStorage.getItem("activeUser"));

  if (!activeUser) {
    window.location.href = "login.html"; 
    return;
  }


  const storageKey = `gameState_${activeUser.username}`;
  const savedData = localStorage.getItem(storageKey);
  const savedState = savedData ? JSON.parse(savedData) : null;

  if (savedState && savedState.currentQuestion < 10 && savedState.countries?.length > 0) {
    gameState = savedState;
    renderQuestion();
  } else {
    await startNewGame();
  }
};


async function startNewGame() {
  try {
    const settings = JSON.parse(localStorage.getItem("gameSettings"));
    const difficulty = settings?.difficulty || "easy";

    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,capital,population,flags"
    );
    
    if (!response.ok) throw new Error("Veri çekilemedi!");

    let allCountries = await response.json();
    let filteredCountries = filterByDifficulty(allCountries, difficulty);
    
  
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.countries = filteredCountries
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    saveGameState();
    renderQuestion();
  } catch (error) {
    console.error("Hata:", error);
    alert("Ülkeler yüklenirken bir sorun oluştu.");
  }
}


function renderQuestion() {
  const country = gameState.countries[gameState.currentQuestion];
  if (!country) return;

  document.getElementById("flagImage").src = country.flags.png;
  document.getElementById("questionNumber").innerText = `Question ${gameState.currentQuestion + 1}/10`;
  

  const form = document.getElementById("formID");
  if (form) form.reset();
  toggleInputs(false);
}


function saveGameState() {
  const activeUser = JSON.parse(localStorage.getItem("activeUser"));
  if (activeUser) {
    const storageKey = `gameState_${activeUser.username}`;
    localStorage.setItem(storageKey, JSON.stringify(gameState));
  }
}


function submitAnswer() {
  const correct = gameState.countries[gameState.currentQuestion];
  toggleInputs(true);

  const countryInput = document.getElementById("countryInput").value.trim();
  const capitalInput = document.getElementById("capitalInput").value.trim();
  const populationInput = parseInt(document.getElementById("populationInput").value) || 0;

  let questionScore = 0;

  if (countryInput.toLowerCase() === correct.name.common.toLowerCase()) questionScore += 10;
  if (correct.capital && capitalInput.toLowerCase() === correct.capital[0].toLowerCase()) questionScore += 10;


  const tolerance = correct.population * 0.1;
  if (Math.abs(correct.population - populationInput) <= tolerance) questionScore += 10;

  gameState.score += questionScore;
  saveGameState(); 

  document.getElementById("correctCountry").innerText = correct.name.common;
  document.getElementById("correctCapital").innerText = correct.capital ? correct.capital[0] : "N/A";
  document.getElementById("correctPopulation").innerText = correct.population.toLocaleString();
  document.getElementById("result").classList.add("active");
}

function nextQuestion() {
  document.getElementById("result").classList.remove("active");
  
  gameState.currentQuestion++;
  saveGameState();

  if (gameState.currentQuestion >= 10) {
    finishGame(); 
  } else {
    renderQuestion();
  }
}


function finishGame() {
  const activeUser = JSON.parse(localStorage.getItem("activeUser"));
  if (!activeUser) return;


  const storageKey = `gameState_${activeUser.username}`;
  localStorage.removeItem(storageKey);

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (!activeUser.scores) activeUser.scores = [];
  
  activeUser.scores.push({
    score: gameState.score,
    difficulty: JSON.parse(localStorage.getItem("gameSettings"))?.difficulty || "easy",
    date: new Date().toLocaleString('tr-TR')
  });

  users = users.map(u => u.username === activeUser.username ? activeUser : u);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("activeUser", JSON.stringify(activeUser));

  window.location.href = "scoreBoard.html";
}


function filterByDifficulty(countries, difficulty) {
  if (difficulty === "easy") return countries.filter(c => c.population < 50000000);
  if (difficulty === "medium") return countries.filter(c => c.population >= 10000000 && c.population <= 100000000);
  return countries.filter(c => c.population > 100000000);
}

function toggleInputs(isDisabled) {
  const inputs = ["countryInput", "capitalInput", "populationInput", "submitBtn"];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = isDisabled;
  });
}