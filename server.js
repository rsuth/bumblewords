const {words} = require('./words.js');

const express = require('express');
const cron = require('cron');
const path = require('path');

const app = express();
app.use(express.static('public'));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))
const port = 3000;

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

function letterGetter() {
    let consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
    let vowels = ['A', 'E', 'I', 'O'];
    
    return shuffle(shuffle(consonants).slice(0, 5).concat(shuffle(vowels).slice(0,2)));
}

function getValidWords(letters) {
    let re = new RegExp(`^[${letters.join('')}]+$`)

    let valid_words = words.filter((word) => {
        return re.test(word) && word.includes(letters[6]);
    });

    return valid_words;
}

function pangramDetector(letters, word) {
    var pangram = true;
    letters.forEach((letter) => {
        if (!word.includes(letter)) {
            pangram = false;
        }
    })
    return pangram;
}

function getTodaysLetters(){
    let done = false;

    while(!done){
        let letters = letterGetter();
        let validWords = getValidWords(letters);
        
        let pangram = false;
        
        validWords.forEach((w, i)=>{
            if(pangramDetector(letters, w)){
                pangram = true;
            }
        });

        if(validWords.length > 15 && pangram){
            done = true;
            return letters;
        }
    }

}

var letters = getTodaysLetters();
console.log(`got new letters: ${letters}`);

var job = new cron.CronJob('0 0 * * *', () => {
    letters = getTodaysLetters();
    console.log(`got new letters: ${letters}`);
}, null, true, 'America/Los_Angeles');

job.start();

app.get('/', (req, res) => {
    res.render('index', {
        letters: JSON.stringify(letters)
    })
})

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})