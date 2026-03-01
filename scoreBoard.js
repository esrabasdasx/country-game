window.onload = function() {
    displayScores();
};

function displayScores() {
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    
    // Güvenlik kontrolü: Kullanıcı veya skorları yoksa başlama
    if (!activeUser || !activeUser.scores || activeUser.scores.length === 0) {
        document.getElementById("scoreList").innerHTML = "<tr><td colspan='3'>Henüz oyun oynanmamış.</td></tr>";
        return;
    }

    const scores = activeUser.scores;

    // 1. En Yüksek Skoru Hesapla
    // Tüm skorlar arasından en büyüğünü bulur
    const highScore = Math.max(...scores.map(s => s.score));
    document.getElementById("highScoreDisplay").innerText = highScore;

    // 2. Son 10 Oyunu Getir
    // Dizinin kopyasını al, ters çevir (en yeni üstte) ve ilk 10'u seç
    const last10Games = [...scores].reverse().slice(0, 10);
    
    const listContainer = document.getElementById("scoreList");
    listContainer.innerHTML = ""; // İçeriği temizle

    last10Games.forEach(game => {
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td>${game.date}</td>
            <td><span class="difficulty-tag ${game.difficulty}">${game.difficulty}</span></td>
            <td><strong>${game.score}</strong></td>
        `;
        
        listContainer.appendChild(row);
    });
}