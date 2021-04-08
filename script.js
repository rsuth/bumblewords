const letters = ["A", "C", "E", "T", "H", "R"];
const keyLetter = "N";
var currentWord = '';
var points = 0;
var foundWords = [];

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
    console.log('rendering points');
    document.querySelector('#scoreboard').textContent = points + ' pts';
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
    })

    document.querySelectorAll('.reg-letter').forEach((el, i) => {

        el.innerHTML = '<h1 class="letter">' + letters[i] + '</h1>';

        el.addEventListener('click', (ev) => {
            currentWord += letters[i];
            renderCurrentWord();
        })
    })

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
            points += 2 * currentWord.length;
            foundWords.push(currentWord);
            currentWord = "";
            flashMsg('nice bae 👍');
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