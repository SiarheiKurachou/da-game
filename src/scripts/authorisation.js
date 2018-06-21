import {
  drawHeroes
} from './actors'

document.getElementById('loginSubmit').addEventListener('click', function () {
  let name = document.getElementById('userName').value;
  let genderBlock = Array.from(document.querySelectorAll('.user-gender'));
  let gender = genderBlock.filter(el => el.checked)[0].value;
  if (name && gender) {
    document.getElementsByClassName('game-menu')[0].style.display = 'block'
    logUserIn(name, gender);
    $('#logInModal').modal('toggle');
    window.location = `${location.href.split('?')[0]}?session=${Date.now()}`;
  }
})


class User {
  constructor(name, gender) {
    this.name = name;
    this.gender = gender;
  }
}

function logUserIn(name, gender) {
  const user = new User(name, gender);
  if (user.name && user.gender) {
    localStorage.user = JSON.stringify(user);
    document.getElementById('onlyLoggedUserContent').style.display = 'block';
  }
  drawHeroes();
}