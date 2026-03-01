/**
 * Sayfa yüklendiğinde çalışacak kontroller
 */
window.addEventListener("DOMContentLoaded", () => {
    checkContinueButton();
});

/**
 * Kullanıcının devam edebileceği bir oyunu olup olmadığını kontrol eder.
 * Eğer yoksa 'Continue Game' butonunu görsel ve işlevsel olarak kapatır.
 */
function checkContinueButton() {
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    
    // Kullanıcı giriş yapmamışsa kontrol etmeye gerek yok
    if (!activeUser) return;

    const storageKey = `gameState_${activeUser.username}`;
    const savedGame = localStorage.getItem(storageKey);

    // HTML içindeki onclick özelliği 'continueGame' içeren butonu bulur
    const continueBtn = document.querySelector("button[onclick*='continueGame']");
    
    if (!savedGame && continueBtn) {
        continueBtn.disabled = true;
        continueBtn.style.opacity = "0.5";
        continueBtn.style.cursor = "not-allowed";
        continueBtn.title = "Kayıtlı oyununuz bulunmamaktadır.";
    }
}

/**
 * Menü seçeneklerini yöneten ana fonksiyon
 * @param {string} option - Seçilen menü öğesi
 */
function selectOptions(option) {
    const activeUser = JSON.parse(localStorage.getItem("activeUser"));
    
    if (!activeUser) {
        window.location.href = "login.html";
        return;
    }

    const storageKey = `gameState_${activeUser.username}`;

    switch (option) {
        case 'game': 
            // YENİ OYUN: Mevcut kullanıcıya ait eski ilerlemeyi temizle
            localStorage.removeItem(storageKey);
            // Zorluk seçimi sayfasına yönlendir
            window.location.href = "mainPage.html"; 
            break;
        
        case 'continueGame':
            // DEVAM ET: game.html içindeki onload, storageKey'i okuyup 
            // kaldığı sorudan render yapacaktır.
            window.location.href = "game.html"; 
            break;
            
        case 'scoreTable':
            // Skor tablosuna yönlendir
            window.location.href = "scoreBoard.html"; 
            break;
            
        case 'exit':
            // Aktif kullanıcıyı temizle ve login sayfasına dön
            window.location.href = "login.html";
            break;    

        default:
            console.error("Hatalı işlem seçildi.");    
    }   
}