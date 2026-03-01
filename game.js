/**
 * OYUN DURUMU (STATE MANAGEMENT)
 * gameState her zaman güncel oyun verilerini bünyesinde tutar.
 */
let gameState = {
  currentQuestion: 0,
  score: 0,
  countries: []
};

/**
 * SAYFA YÜKLENDİĞİNDE (INIT)
 * Kullanıcının giriş yapıp yapmadığını ve yarım kalmış bir oyunu olup olmadığını kontrol eder.
 */
window.onload = async function() {
  const activeUser = JSON.parse(localStorage.getItem("activeUser"));

  if (!activeUser) {
    window.location.href = "login.html"; // Giriş yapılmamışsa login'e yönlendir
    return;
  }

  // Kullanıcıya özel anahtar oluşturma
  const storageKey = `gameState_${activeUser.username}`;
  const savedData = localStorage.getItem(storageKey);
  const savedState = savedData ? JSON.parse(savedData) : null;

  // Güvenlik Kontrolü: Eğer yarım kalmış ve geçerli bir oyun varsa onu yükle
  if (savedState && savedState.currentQuestion < 10 && savedState.countries?.length > 0) {
    gameState = savedState;
    renderQuestion();
  } else {
    // Yoksa veya oyun bitmişse yeni oyun başlat
    await startNewGame();
  }
};

/**
 * YENİ OYUN BAŞLATMA
 * Ayarları okur, API'den veri çeker ve ilk soruyu hazırlar.
 */
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
    
    // Oyun durumunu sıfırla ve rastgele 10 ülke seç
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

/**
 * SORUYU EKRANA BASMA (UI RENDER)
 */
function renderQuestion() {
  const country = gameState.countries[gameState.currentQuestion];
  if (!country) return;

  document.getElementById("flagImage").src = country.flags.png;
  document.getElementById("questionNumber").innerText = `Question ${gameState.currentQuestion + 1}/10`;
  
  // Formu ve girdileri temizle
  const form = document.getElementById("formID");
  if (form) form.reset();
  toggleInputs(false);
}

/**
 * VERİYİ KAYDETME (LOCALSTORAGE)
 * Kullanıcıya özel anahtar ile oyun ilerlemesini kaydeder.
 */
function saveGameState() {
  const activeUser = JSON.parse(localStorage.getItem("activeUser"));
  if (activeUser) {
    const storageKey = `gameState_${activeUser.username}`;
    localStorage.setItem(storageKey, JSON.stringify(gameState));
  }
}

/**
 * CEVABI KONTROL ETME
 * Ülke, başkent ve nüfus (tolere paylı) kontrolü yapar.
 */
function submitAnswer() {
  const correct = gameState.countries[gameState.currentQuestion];
  toggleInputs(true);

  const countryInput = document.getElementById("countryInput").value.trim();
  const capitalInput = document.getElementById("capitalInput").value.trim();
  const populationInput = parseInt(document.getElementById("populationInput").value) || 0;

  let questionScore = 0;

  if (countryInput.toLowerCase() === correct.name.common.toLowerCase()) questionScore += 10;
  if (correct.capital && capitalInput.toLowerCase() === correct.capital[0].toLowerCase()) questionScore += 10;

  // Nüfus tolerans kontrolü (%10)
  const tolerance = correct.population * 0.1;
  if (Math.abs(correct.population - populationInput) <= tolerance) questionScore += 10;

  gameState.score += questionScore;
  saveGameState(); // Skoru anlık kaydet

  // Sonuçları göster
  document.getElementById("correctCountry").innerText = correct.name.common;
  document.getElementById("correctCapital").innerText = correct.capital ? correct.capital[0] : "N/A";
  document.getElementById("correctPopulation").innerText = correct.population.toLocaleString();
  document.getElementById("result").classList.add("active");
}

/**
 * SONRAKİ SORUYA GEÇİŞ
 */
function nextQuestion() {
  document.getElementById("result").classList.remove("active");
  
  gameState.currentQuestion++;
  saveGameState();

  if (gameState.currentQuestion >= 10) {
    finishGame(); // 10 soru bittiğinde otomatik bitir
  } else {
    renderQuestion();
  }
}

/**
 * OYUNU BİTİRME VE SKORU KAYDETME
 * 10 soru bittiğinde veya "Game Over" butonuna basıldığında tetiklenir.
 */
function finishGame() {
  const activeUser = JSON.parse(localStorage.getItem("activeUser"));
  if (!activeUser) return;

  // 1. KRİTİK: Mevcut ilerlemeyi SİL. 
  // Bu satır sayesinde bir sonraki girişte kaldığı yerden DEVAM ETMEZ.
  const storageKey = `gameState_${activeUser.username}`;
  localStorage.removeItem(storageKey);

  // 2. Skor Kayıt İşlemleri
  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (!activeUser.scores) activeUser.scores = [];
  
  activeUser.scores.push({
    score: gameState.score,
    difficulty: JSON.parse(localStorage.getItem("gameSettings"))?.difficulty || "easy",
    date: new Date().toLocaleString('tr-TR')
  });

  // 3. Verileri Güncelle ve Kaydet
  users = users.map(u => u.username === activeUser.username ? activeUser : u);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("activeUser", JSON.stringify(activeUser));

  // 4. Scoreboard'a Yönlendir
  window.location.href = "scoreBoard.html";
}

/**
 * YARDIMCI FONKSİYONLAR
 */
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