const PANGRAM_BONUS = 7;
// server always sends key letter last
const keyLetter = letters[6];
var currentWord = '';
var points = 0;
var foundWords = [];
var validWords = getValidWords();

var maxWords = validWords.length;
var maxScore = validWords.reduce((acc, word) => {
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
    letters.forEach((letter) => {
        if (!word.includes(letter)) {
            pangram = false;
        }
    })
    return pangram;
}

function getValidWords() {
    let re = new RegExp(`^[${letters.join('')}]+$`)

    let valid_words = words.filter((word) => {
        return re.test(word) && word.includes(keyLetter);
    });

    return valid_words;
}

function checkWord(word) {
    if (validWords.includes(word)) {
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
        + '/' + validWords.length + ' words found)';
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
    let tmp = shuffle(letters);
    let keyIndex = tmp.findIndex((l) => l === keyLetter);
    
    // swap so keyLetter is at the end
    [tmp[keyIndex], tmp[tmp.length-1]] = [tmp[tmp.length-1], tmp[keyIndex]];
    
    // rebuild dom - removes events
    document.querySelectorAll('#hexGrid')[0].outerHTML = document.querySelectorAll('#hexGrid')[0].outerHTML;

    document.querySelectorAll('.reg-letter').forEach((el, i) => {
        console.log(tmp[i]);
        el.innerHTML = '<h1 class="letter">' + tmp[i] + '</h1>';
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

    document.querySelectorAll('.key-letter')[0].innerHTML = '<h1 class="letter">' + keyLetter + '</h1>';

    document.querySelectorAll('.key-letter')[0].addEventListener('click', (ev) => {
        currentWord += keyLetter;
        renderCurrentWord();
    });

    renderPoints();

    document.querySelectorAll('.reg-letter').forEach((el, i) => {
        if (letters[i] !== keyLetter) {
            el.innerHTML = '<h1 class="letter">' + letters[i] + '</h1>';
            el.addEventListener('click', addLetter(letters[i]), false);
        }
    });

    document.querySelector('#enter-btn').addEventListener('click', function (e) {
        if (currentWord.length < 4) {
            flashMsg("too few letters :(");
            currentWord = "";
            renderCurrentWord();
            return;
        }

        if (!currentWord.includes(keyLetter)) {
            currentWord = "";
            flashMsg('need middle letter :(');
            renderCurrentWord();
            return;
        }

        if (foundWords.includes(currentWord)) {
            flashMsg('already found that one');
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
        } else {
            flashMsg('word not found :(');
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

