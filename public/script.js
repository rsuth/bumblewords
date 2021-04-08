const letters = ["A", "C", "E", "T", "H", "R", "N"];
const keyLetter = "N";
const PANGRAM_BONUS = 7;
var currentWord = '';
var points = 0;
var foundWords = [];
var maxScore = getMaxScore();

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

console.log(pangramDetector('ENCHANTER'));

function scoreWord(word) {
    let score = 1
    if (word.length === 4) {
        return score;
    } else {
        score = word.length;
    }
    if(pangramDetector(word)){
        score += PANGRAM_BONUS;
    }
    return score;
}

function pangramDetector(word) {
    var pangram = true;
    letters.forEach((letter)=>{
        if(!word.includes(letter)){
            pangram = false;
        }
    })
    return pangram;
}

function getMaxScore() {
    let re = new RegExp(`^[${letters.join('')}]+$`)

    let valid_words = words.filter((word) => {
        return re.test(word);
    });

    var maxScore = valid_words.reduce((acc, word) => {
        return acc + scoreWord(word);
    }, 0);

    return maxScore;
}

function lookup(word) {
    if (words.includes(word)) {
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
    document.querySelector('#scoreboard').textContent = points + 'pts / ' + maxScore + 'pts possible';
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

            el.addEventListener('click', (ev) => {
                currentWord += letters[i];
                renderCurrentWord();
            })
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

        if (lookup(currentWord)) {
            let score = scoreWord(currentWord);
            points += score;
            foundWords.push(currentWord);
            
            if(pangramDetector(currentWord)){
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
});

