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

function setCookie(name, value, exp, path = '/') {
    const expires = exp.toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=' + path + '; SameSite=Lax';
};

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '');
};

function deleteCookie(name, path = '/') {
    setCookie(name, '', new Date(Date.now() + -1 * 864e5), path)
};


async function postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
    });
    return response.json();
};

function saveGame(){
    let midnight = new Date();
    midnight.setHours(23,59,59,0);
    
    deleteCookie('words');
    deleteCookie('score');
    
    setCookie('words', JSON.stringify(foundWords), midnight);
    setCookie('score', points, midnight);
}

function loadGame() {
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
    foundWords = foundWords.sort();
    foundWords.forEach((w, i) => {
        let html = "";
        for(let i = 0; i < w.length; i++){
            if(w[i] === keyLetter){
                html += `<span style="color:#fcd703">${w[i]}</span>`; 
            } else {
                html += w[i];
            }
        }
        if(pangramDetector(w)){
            html = `✨${html}✨`
        }
        var li = document.createElement('li');
        li.innerHTML = html;
        foundEl.appendChild(li);
    })
}

function flashMsg(msg) {
    var msgEl = document.querySelectorAll('#message')[0];
    msgEl.textContent = msg;
    // Add the "show" class to DIV
    msgEl.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(() => { msgEl.className = msgEl.className.replace = ("show", ""); }, 1200);
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
    document.querySelector('.hexGridContainer').outerHTML = document.querySelector('.hexGridContainer').outerHTML;

    document.querySelectorAll('.reg-tile').forEach((el, i) => {
        el.childNodes[0].textContent = tmp[i];
        el.addEventListener('click', addLetter(tmp[i]), false);
    });

    var keyTileEl = document.querySelector('#key-tile');
    keyTileEl.addEventListener('click', addLetter(keyLetter), false);
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

function enterCurrentWord() {
    if (currentWord.length < 4) {
        flashMsg("too few letters 😬");
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
        flashMsg('already found that one 😬');
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
}

function deleteChar() {
    if (currentWord.length > 0) {
        currentWord = currentWord.slice(0, -1);
        renderCurrentWord();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    loadGame();
    
    document.querySelector('#key-tile').childNodes[0].textContent = keyLetter;
    
    document.querySelector('#key-tile').addEventListener('click', (ev) => {
        currentWord += keyLetter;
        renderCurrentWord();
    });

    renderPoints();

    document.querySelectorAll('.reg-tile').forEach((el, i) => {
        if (LETTERS[i] !== keyLetter) {
            el.childNodes[0].textContent = LETTERS[i];
            el.addEventListener('click', addLetter(LETTERS[i]), false);
        }
    });

    document.querySelector('#enter-btn').addEventListener('click', enterCurrentWord);

    document.querySelector('#del-btn').addEventListener('click', deleteChar);

    document.querySelector('#shuffle-btn').addEventListener('click', shuffleTiles);
});

