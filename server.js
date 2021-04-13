const {words} = require('./words.js');
const express = require('express');
const cron = require('cron');
const path = require('path');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use((req, res, next) => {
    const { headers: { cookie } } = req;
    if (cookie) {
        const values = cookie.split(';').reduce((res, item) => {
            const data = item.trim().split('=');
            return { ...res, [data[0]]: data[1] };
        }, {});
        res.locals.cookie = values;
    }
    else res.locals.cookie = {};
    next();
});

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

function updateLeaderboard(name, score){
    if (leaderboard.some(e => e.name === name)) {
        leaderboard.forEach((e, i)=>{
            if(e.name === name){
                let parsedScore = parseInt(score);
                if(!Number.isNaN(parsedScore)){
                    leaderboard[i].score = parsedScore;
                }
            }
        })
        
    } else {
        leaderboard.push({name: name, score: parseInt(score)});
    }
    leaderboard.sort((a, b) => (a.score > b.score) ? -1 : 1);
}

var letters = getTodaysLetters();
var leaderboard = [];

var job = new cron.CronJob('0 0 * * *', () => {
    letters = getTodaysLetters();
    console.log(`got new letters: ${letters}`);
    leaderboard = [];
    console.log('cleared leaderboard');
}, null, true, 'America/Los_Angeles');

job.start();

app.get('/', (req, res) => {
    if(res.locals.cookie.username){
        console.log(`get / from ${res.locals.cookie.username}`);
    } else {
        console.log('connection from new user');
    }
    res.render('index', {
        letters: JSON.stringify(letters)
    })
});

app.get('/leaderboard', (req, res) => {
    var templateVars = {};
    
    if(res.locals.cookie.username && res.locals.cookie.score){
        updateLeaderboard(res.locals.cookie.username, res.locals.cookie.score);
        templateVars.leaderboard = leaderboard;
        templateVars.username = res.locals.cookie.username;
    } else {
        templateVars.leaderboard = leaderboard;
        templateVars.username = "";
    }
    res.render('leaderboard', templateVars);
});

app.post('/leaderboard', (req, res)=>{
    console.log(`${req.body.username} posted a new score to the leaderboard: ${res.locals.cookie.score}`);
    if(res.locals.cookie.score !== undefined){
        updateLeaderboard(req.body.username, res.locals.cookie.score);
    }

    res.render('leaderboard', {
        leaderboard: leaderboard,
        hasUser: true,
        username: req.body.username
    });
})


app.listen(port, () => {
    console.log(`listening on port ${port}`);
})