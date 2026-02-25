function selectOptions(option){
    localStorage.setItem("userChoosing", JSON.stringify({choosing: option})
    );    

    //gelen seçeneğe göre bir yönlendirme yapıyoruz

    switch (option) {
        case 'game': 
            window.location.href = "mainPage.html";
            break;
        
        case 'scoreTable':
            window.location.href = "scoreBoard.html"; 
            break;
            
        case 'exit':
            window.location.href = "login.html";
            break;    

        default:
            console.log("hata");    
    }   
}