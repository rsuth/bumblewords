// server always sends key letter last
const keyLetter = LETTERS[6];
var currentWord = '';
var points = 0;
var foundWords = [];

var maxWords = VALID_WORDS.length;
var maxScore = VALID_WORDS.reduce((acc, word) => {
    return acc + scoreWord(word);
}, 0);

const successMessages = [
    '🐝 un bee lievable 🐝',
    '🐝 bee-utiful 🐝',
    '🐝 hive five 🖐️ 🐝',
    '🐝 sweet like honey 🐝',
    '🐝 not too sha-bee 🐝',
    '🐝 thats the bees knees 🐝',
    '🐝 bumbleicious 🐝',
    '🐝 im getting buzzed 🐝',
    '🐝 youre the queen bee 🐝',
    '🐝 bee mine 🐝'
]

function setCookie(name, value, exp, path = '/'){
    const expires = exp.toUTCString()
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=' + path
}

function getCookie(name){
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=')
        return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '')
}

function deleteCookie(name, path = '/'){
    setCookie(name, '', new Date(Date.now() + -1 * 864e5), path)
}

// Example POST method implementation:
async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }
  

function saveGame(){
    let midnight = new Date();
    midnight.setHours(23,59,59,0);
    
    deleteCookie('words');
    deleteCookie('score');
    
    setCookie('words', JSON.stringify(foundWords), midnight);
    setCookie('score', points, midnight);
}

function loadGame(){
    var words = getCookie('words');
    var score = getCookie('score');
    
    if(words && score){ // the cookies exist
        let savedWords = JSON.parse(words);
        // check to see if the saved words are from todays game (its 
        // technically possible two consecutive days could share a few 
        // valid words but unlikely)
        if(VALID_WORDS.includes(savedWords[0])){
            // load saved state
            foundWords = savedWords;
            points = parseInt(score);
            renderFoundWords();
            renderPoints();
        } else {
            // do nothing, delete these old cookies.
            deleteCookie('words');
            deleteCookie('score');
        }
    } else {
        let midnight = new Date();
        midnight.setHours(23,59,59,0);
        // set empty cookies
        setCookie('words', JSON.stringify(foundWords), midnight);
        setCookie('score', points, midnight);
    }
}

function scoreWord(word) {
    let score = 1
    if (word.length === 4) {
        return score;
    } else {
        score = word.length;
    }
    if (pangramDetector(word)) {
        score += PANGRAM_BONUS;
    }
    return score;
}

function pangramDetector(word) {
    var pangram = true;
    LETTERS.forEach((letter) => {
        if (!word.includes(letter)) {
            pangram = false;
        }
    })
    return pangram;
}

function checkWord(word) {
    if (VALID_WORDS.includes(word)) {
        return true;
    } else {
        return false;
    }
};

function renderCurrentWord() {
    var formatted = "";
    for (let i = 0; i < currentWord.length; i++) {
        if (currentWord[i] === keyLetter) {
            let s = '<span style="color:#fcd703">' + currentWord[i] + '</span>';
            formatted += s;
        } else {
            formatted += currentWord[i];
        }
    }
    document.getElementById('current-word').innerHTML = formatted;
}

function renderPoints() {
    document.querySelector('#scoreboard').textContent = points + 'pts (' + foundWords.length
        + '/' + VALID_WORDS.length + ' words found)';
}

function renderFoundWords() {
    var foundEl = document.getElementById('wordlist');
    foundEl.innerHTML = "";
    foundWords.forEach((w, i) => {
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(w));
        foundEl.appendChild(li);
    })
}

function flashMsg(msg) {
    var msgEl = document.querySelectorAll('#message')[0];
    msgEl.textContent = msg;
    // Add the "show" class to DIV
    msgEl.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () { msgEl.className = msgEl.className.replace("show", ""); }, 1200);
}

function addLetter(l) {
    return function () {
        currentWord += l;
        renderCurrentWord();
    }
}

function shuffleTiles() {
    let tmp = shuffle(LETTERS);
    let keyIndex = tmp.findIndex((l) => l === keyLetter);

    // swap so keyLetter is at the end
    [tmp[keyIndex], tmp[tmp.length - 1]] = [tmp[tmp.length - 1], tmp[keyIndex]];

    // rebuild dom - removes events
    document.querySelectorAll('#hexGrid')[0].outerHTML = document.querySelectorAll('#hexGrid')[0].outerHTML;

    document.querySelectorAll('.reg-letter').forEach((el, i) => {
        el.innerHTML = '<h1 class="letter noselect">' + tmp[i] + '</h1>';
        el.addEventListener('click', addLetter(tmp[i]), false);
    });

    document.querySelectorAll('.key-letter')[0].addEventListener('click', addLetter(keyLetter), false);
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


document.addEventListener('DOMContentLoaded', function (event) {
    loadGame();
    document.querySelectorAll('.key-letter')[0].innerHTML = '<h1 class="letter noselect">' + keyLetter + '</h1>';

    document.querySelectorAll('.key-letter')[0].addEventListener('click', (ev) => {
        currentWord += keyLetter;
        renderCurrentWord();
    });

    renderPoints();

    document.querySelectorAll('.reg-letter').forEach((el, i) => {
        if (LETTERS[i] !== keyLetter) {
            el.innerHTML = '<h1 class="letter noselect">' + LETTERS[i] + '</h1>';
            el.addEventListener('click', addLetter(LETTERS[i]), false);
        }
    });

    document.querySelector('#enter-btn').addEventListener('click', function (e) {
        if (currentWord.length < 4) {
            flashMsg("too few LETTERS 😬");
            currentWord = "";
            renderCurrentWord();
            return;
        }

        if (!currentWord.includes(keyLetter)) {
            currentWord = "";
            flashMsg('need middle letter 😬');
            renderCurrentWord();
            return;
        }

        if (foundWords.includes(currentWord)) {
            flashMsg('already found that one 😬 ');
            currentWord = "";
            renderCurrentWord();
            return;
        }

        if (checkWord(currentWord)) {
            let score = scoreWord(currentWord);
            points += score;
            foundWords.push(currentWord);

            if (pangramDetector(currentWord)) {
                flashMsg(`🐝 bzzz...pangram!!! 😲 🐝 +${score}`);
            } else {
                flashMsg(`${successMessages[Math.floor(Math.random() * successMessages.length)]} +${score}`);
            }

            currentWord = "";
            renderCurrentWord();
            renderPoints();
            renderFoundWords();
            saveGame();
            postData('/update');
            if(foundWords.length === VALID_WORDS.length){
                alert("great job! you found all the words!")
            }
        } else {
            flashMsg('word not found 😬');
            currentWord = "";
            renderCurrentWord();
        }
    });

    document.querySelector('#del-btn').addEventListener('click', function (e) {
        if (currentWord.length > 0) {
            currentWord = currentWord.slice(0, -1);
            renderCurrentWord();
        }
    });

    document.querySelector('#shuffle-btn').addEventListener('click', shuffleTiles);
});

