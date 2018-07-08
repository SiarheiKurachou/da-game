import * as Constants from './constants';
import countingTask from './tasks/counting/counting';
import getSpeechWord from './tasks/speech/speech';
import getTranslation from './tasks/translation/translation';
import { createSpell, enemyAttack } from './spellCast';
import getCapital from './tasks/countryCapitals/countryCapitals';
import getAnimal from './tasks/animalSounds/animalSounds';
import getFlag from './tasks/flag/flag';
import getAnimalImage from './tasks/animal/animal';
import getWord from './tasks/shuffledWords/shuffledWords';
import typeNumber from './tasks/typeNumber/typeNumber';
import typeSign from './tasks/typeSign/typeSign';

export default function taskWindowLoader(spell, start, target) {
  $('#userModalTaskContainer').empty();
  $('#modalFooter').empty();
  addTask(spell, start, target);
}

async function addTask(spell, start, target) {
  const randomTask = Constants.TASKSLIST[Math.floor(Math.random() * Constants.TASKSLIST.length)];
  let type;
  let toDo;
  let task;
  let answer;
  let preventFlag = false;
  switch (randomTask) {
    case 'counting':
      [toDo, task, answer, type] = countingModule();
      break;
    case 'typeNumber':
      [toDo, task, answer, type] = typeNumberMoudule();
      break;
    case 'typeSign':
      [toDo, task, answer, type] = typeSignModule();
      break;
    case 'translation':
      [toDo, task, answer, type] = await translationModule();
      break;
    case 'capitals':
      [toDo, task, answer, type] = await capitalsModule();
      break;
    case 'animalSounds':
      [toDo, task, answer, type] = await animalsSoundsModule();
      break;
    case 'flag':
      [toDo, task, answer, type] = await flagModule();
      break;
    case 'animals':
      [toDo, task, answer, type] = await animalsModule();
      break;
    case 'shuffledWords':
      [toDo, task, answer, type] = await shuffledWordsModule();
      break;
    case 'speech':
      [toDo, task, answer, type] = await speechModule();
      break;
    case 'sortableWords':
      preventFlag = await sortableWordsModule();
      break;
  }
  if (!preventFlag) {
    createTaskQuiz(toDo, task);
    createSolveElement(type);
    createSubmitButton();
    document.getElementById('submitTask').addEventListener('click', () => {
      isSolved(answer, spell, start, target);
    });
    document.getElementById('userAnswer').addEventListener('keyup', evt => {
      evt.preventDefault();
      if (evt.keyCode === Constants.KEYBOARDEVENT.ENTER) {
        document.getElementById('submitTask').click();
      }
    });
  }
}

function typeNumberMoudule() {
  const toDo = 'Type right number';
  const type = 'number';
  const [task, answer] = typeNumber();
  return [toDo, task, answer, type];
}

function countingModule() {
  const toDo = 'Count';
  const type = 'number';
  const [task, answer] = countingTask();
  return [toDo, task, answer, type];
}

function typeSignModule() {
  const toDo = 'Type right sign';
  const type = 'text';
  const [task, answer] = typeSign();
  return [toDo, task, answer, type];
}

async function translationModule() {
  const toDo = 'Translate';
  const type = 'text';
  const [task, answer] = await getTranslation();
  return await [toDo, task, answer, type];
}

async function capitalsModule() {
  const toDo = 'Write capital';
  const type = 'text';
  const [task, answer] = await getCapital();
  return await [toDo, task, answer, type];
}

async function animalsSoundsModule() {
  const toDo = 'Write animal';
  const type = 'text';
  const [task, answer] = await getAnimal();
  return await [toDo, task, answer, type];
}

async function flagModule() {
  const toDo = "Who's is this flag?";
  const type = 'text';
  const task = '';
  const [flagImage, answer] = await getFlag();
  drawImage(flagImage);
  return await [toDo, task, answer, type];
}

async function animalsModule() {
  const toDo = 'Who is it?';
  const type = 'text';
  const task = '';
  const [animalImage, answer] = await getAnimalImage();
  drawImage(animalImage);
  return await [toDo, task, answer, type];
}

async function shuffledWordsModule() {
  const toDo = 'What word is it';
  const type = 'text';
  const task = '';
  const [shuffledWord, answer] = await getWord();
  createShuffledWord(shuffledWord);
  return await [toDo, task, answer, type];
}

async function speechModule() {
  const toDo = 'Write what you hear';
  const type = 'text';
  const task = '';
  const answer = await getSpeechWord();
  setTimeout(() => {
    speakToMe(answer);
  }, Constants.SPEECH_DELATION);
  createRepeatButton(answer);
  return await [toDo, task, answer, type];
}

async function sortableWordsModule() {
  const toDo = 'Sort letters to get the word';
  const [wordForShuffle, answer] = await getWord();
  const task = '';
  createTaskQuiz(toDo, task);
  createSortableWord(wordForShuffle);
  const preventFlag = true;
  createSubmitButton();
  document.getElementById('submitTask').addEventListener('click', () => {
    isSorted(answer, spell, start, target);
  });
  return await preventFlag;
}

function isSorted(answer, spell, start, target) {
  const userAnswer = Array.from(document.querySelectorAll('.letter'))
    .map(el => el.textContent)
    .join('');
  const tasksQuiz = document.getElementById('taskQuiz');
  tasksQuiz.style.color = 'red';
  if (answer.toString().toLowerCase() === userAnswer.toLowerCase().trim()) {
    tasksQuiz.innerText = 'RIGHT!';
    setInterval(createSpell(spell, start, target), Constants.MODAL_DELATION);
  } else {
    tasksQuiz.innerText = `WRONG! Answer is '${answer}'`;
    setInterval(enemyAttack(), Constants.MODAL_DELATION);
  }
  tasksQuiz.style.color = 'black';
}

function createSortableWord(wordArr) {
  const shuffledwordElement = document.createElement('span');
  shuffledwordElement.setAttribute('id', 'sortable');
  wordArr.forEach(el => {
    const letterElement = document.createElement('span');
    letterElement.setAttribute('class', 'letter');
    letterElement.textContent = el;
    shuffledwordElement.appendChild(letterElement);
  });
  document.getElementById('userModalTaskContainer').appendChild(shuffledwordElement);
  $(() => {
    $('#sortable').sortable();
    $('#sortable').disableSelection();
  });
}

function createShuffledWord(wordArr) {
  const shuffledwordElement = document.createElement('span');
  wordArr.forEach(el => {
    const letterElement = document.createElement('span');
    letterElement.setAttribute('class', 'letter');
    letterElement.textContent = el;
    shuffledwordElement.appendChild(letterElement);
  });
  document.getElementById('userModalTaskContainer').appendChild(shuffledwordElement);
}

function drawImage(imageSrc) {
  const imageElement = document.createElement('img');
  imageElement.setAttribute('src', imageSrc);
  imageElement.setAttribute('width', '50%');
  imageElement.style.border = 'black 1px solid';
  document.getElementById('userModalTaskContainer').appendChild(imageElement);
}

function speakToMe(word) {
  const synth = window.speechSynthesis;
  synth.getVoices();
  const wordSpeech = new SpeechSynthesisUtterance(word);
  wordSpeech.lang = 'en-US';
  wordSpeech.pitch = 0.7;
  synth.speak(wordSpeech);
}

function isSolved(answer, spell, start, target) {
  const userAnswer = document.getElementById('userAnswer').value;
  const tasksQuiz = document.getElementById('taskQuiz');
  tasksQuiz.style.color = 'red';
  if (answer.toString().toLowerCase() === userAnswer.toLowerCase().trim()) {
    tasksQuiz.innerText = 'RIGHT!';
    setInterval(createSpell(spell, start, target), Constants.MODAL_DELATION);
  } else {
    tasksQuiz.innerText = `WRONG! Answer is '${answer}'`;
    setInterval(enemyAttack(), Constants.MODAL_DELATION);
  }
  tasksQuiz.style.color = 'black';
}

function createSubmitButton() {
  const submitButton = document.createElement('button');
  submitButton.setAttribute('class', 'btn btn-primary float-left');
  submitButton.setAttribute('id', 'submitTask');
  submitButton.setAttribute('data-dismiss', 'modal');
  submitButton.innerHTML = 'Submit';
  document.getElementById('modalFooter').appendChild(submitButton);
}

function createRepeatButton(word) {
  const repeatButton = document.createElement('button');
  repeatButton.setAttribute('class', 'btn btn-danger float-right');
  repeatButton.setAttribute('id', 'repeatTask');
  repeatButton.innerHTML = 'Repeat';
  repeatButton.addEventListener('click', () => {
    speakToMe(word);
  });
  document.getElementById('modalFooter').appendChild(repeatButton);
}

function createTaskQuiz(toDo, task) {
  const tempTasksQuiz = document.createElement('h3');
  tempTasksQuiz.setAttribute('id', 'taskQuiz');
  tempTasksQuiz.innerText = `${toDo}: ${task}`;
  document.getElementById('userModalTaskContainer').appendChild(tempTasksQuiz);
}

function createSolveElement(type) {
  const tempElemet = document.createElement('input');
  tempElemet.classList.add('form-control');
  tempElemet.setAttribute('id', 'userAnswer');
  tempElemet.setAttribute('type', `${type}`);
  document.getElementById('userModalTaskContainer').appendChild(tempElemet);
  document.onkeypress = () => {
    document.getElementById('userAnswer').focus();
  };
}
