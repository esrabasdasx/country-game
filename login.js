// parolaları şifrelemek için (hashlemek) kullanılan yapı
async function hashPassword(password){

    //metni byte dizisine çevirmek için kullanılır
    const msgUint8 = new TextEncoder().encode(password);

    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}  
  
  let users = JSON.parse(localStorage.getItem("users")) || [];

  const loginForm = document.querySelector('#loginForm');
  const usernameInput = document.querySelector('#username');
  const passInput = document.querySelector('#password');

  window.onload = updateSuggestions;


loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const userValue = usernameInput.value;
    const passValue = document.querySelector('#password').value;

    const hashed = await hashPassword(passValue);

    const userData = {
        username: userValue,
        password: hashed,
        scores: []
    };

    //bu yeni bir kullanıcı ise sisteme kaydetmek için:
    const userExist = users.find(u => u.username === userValue);
    if(!userExist){
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
    }
    //daha sonra sisteme kayıt yapan her kullanıcıyı kaydetmeyi sağlar.
    localStorage.setItem('activeUser', JSON.stringify(userData));
    window.location.href = "options.html";

});

function updateSuggestions(){
    const datalist = document.querySelector('#userSuggestion');
    datalist.innerHTML = "";

    const uniqueNames = [...new Set(users.map(u => u.username))];
    uniqueNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        datalist.appendChild(option);
    });
}

