window.onload = function() {
    displayScores();
};

function displayScores() {
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    
    if (!activeUser || !activeUser.scores || activeUser.scores.length === 0) {
        // Hata mesajını tablo yapısına uygun güncelledik
        document.getElementById("scoreList").innerHTML = "<tr><td colspan='3'>Henüz oyun oynanmamış.</td></tr>";
        return;
    }

    // 1. Kişisel Rekoru (En Yüksek Skor) Göster
    const scores = activeUser.scores;
    const highScore = Math.max(...scores.map(s => s.score));
    document.getElementById("highScoreDisplay").innerText = highScore;

    // 2. Son 10 Oyunu Listele
    const last10Games = [...scores].reverse().slice(0, 10);
    const listContainer = document.getElementById("scoreList");
    listContainer.innerHTML = ""; 

    last10Games.forEach(game => {
        const row = document.createElement("tr");
        
        row.innerHTML = `
            <td>${activeUser.username || "Guest"}</td> 
            <td><span class="difficulty-tag ${game.difficulty}">${game.difficulty}</span></td>
            <td><strong>${game.score}</strong></td>
        `;
        
        listContainer.appendChild(row);
    });
}