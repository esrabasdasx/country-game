const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();



const user = document.querySelector('#username').value;
const pass = document.querySelector('#password').value;

const userData = {
    username: user,
    password: pass
};
localStorage.setItem('activeUser', JSON.stringify(userData));


window.location.href = "options.html";
});

