import { loggerMiddleware, getLetterSet, scoreWords, getValidWords, loadDictionary } from './utils.js';
import express from 'express';
import { CronJob } from 'cron';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import nedb from 'nedb';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = 3000;

const MIN_VALID_WORDS = 20;
const PANGRAM_BONUS = 7;
const dictionary = loadDictionary('dictionary.txt');

// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(loggerMiddleware);
app.set('view engine', 'pug');
app.set('views', path.join(path.resolve(), 'views'))

console.log(`Starting server...`);
console.log(`creating database interfaces...`);

var leaderboardDB = new nedb({
    filename: path.join(path.resolve(), 'leaderboard.db'),
    autoload: true
});

leaderboardDB.ensureIndex({ fieldName: 'userId', unique: true });

var puzzleDB = new nedb({
    filename: path.join(path.resolve(), 'puzzle.db'),
    autoload: true
});

var puzzle = {
    letters: [],
    validWords: []
};

var yesterday = {
    winner: {},
    answers: [],
    letters: []
};

const createNewPuzzle = (puzzleDB, dictionary) => {
    console.log(`Creating new puzzle...`);
    // reset today and yesterday
    today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`todays date: ${today}`);

    letters = getLetterSet(dictionary, MIN_VALID_WORDS);
    validWords = getValidWords(letters, dictionary);

    console.log(`New puzzle created: ${letters}`);

    puzzleDB.insert({ date: today, letters: letters });

    return { letters, validWords }
}

const getYesterdaysWinner = (leaderboardDB) => {
    let today = new Date();
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // find yesterdaysWinner:
    return new Promise((resolve, reject) => {
        leaderboardDB.find({ date: { $gt: yesterday, $lt: today } }).sort({ score: -1, date: 1 }).exec((err, docs) => {
            if (err) {
                reject(err);
            }
            if (docs[0] != undefined) {
                console.log(`found yesterdays winner: ${docs[0].nickname}`);
                resolve({ nickname: docs[0].nickname, score: docs[0].score });
            } else {
                console.log(`found no winner for yesterday.`);
                resolve({ nickname: "", score: 0 });
            }
        });
    });
};

const getYesterdaysAnswers = (puzzleDB) => {
    let today = new Date();
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // find yesterdaysAnswers:
    return new Promise((resolve, reject) => {
        puzzleDB.findOne({ date: { $gte: yesterday, $lt: today } }, (err, doc) => {
            if (err) {
                reject(err);
            }
            let answers = [];
            let letters = [];
            if (doc) {
                answers = getValidWords(doc.letters, dictionary);
                letters = doc.letters;
                console.log(`found yesterdays puzzle: ${letters} (${answers.length} words)`);
            } else {
                console.log('could not find yesterdays puzzle');
            }
            resolve({ answers: answers, letters: letters });
        });
    });
}

function createNewUser(leaderboardDB, words, score) {
    let userId = uuidv4().slice(0, 8);
    leaderboardDB.insert({
        date: new Date(),
        userId: userId,
        nickname: 'anonymous user',
        words: words,
        score: score
    });
    console.log('creating user: ' + userId)
    return userId
}

// look for a puzzle with todays date in puzzleDB.
let today = new Date();
today.setHours(0, 0, 0, 0);
puzzleDB.findOne({ date: { $gte: today } }, (err, doc) => {
    if (doc) {
        console.log(`Found puzzle created today: ${doc.letters}`);
        puzzle.letters = doc.letters;
        puzzle.validWords = getValidWords(doc.letters, dictionary);
    } else {
        puzzle = createNewPuzzle(puzzleDB, dictionary);
    }
});

// get winner from yesterday
getYesterdaysWinner(leaderboardDB)
    .then(res => {
        yesterday.winner = res;
    })
    .catch(err => {
        console.log(err);
    });

// get answers and letters from yesterday   
getYesterdaysAnswers(puzzleDB)
    .then(res => {
        yesterday.answers = res.answers;
        yesterday.letters = res.letters;
    })
    .catch(err => {
        console.log(err);
    });

// set up cron job to run at midnight to make new puzzle
var job = new CronJob('0 0 * * *', () => {
    puzzle = createNewPuzzle(puzzleDB, dictionary);
    // get winner from yesterday
    getYesterdaysWinner(leaderboardDB)
        .then(res => {
            yesterday.winner = res;
        })
        .catch(err => {
            console.log(err);
        });

    // get answers and letters from yesterday   
    getYesterdaysAnswers(puzzleDB)
        .then(res => {
            yesterday.answers = res.answers;
            yesterday.letters = res.letters;
        })
        .catch(err => {
            console.log(err);
        });
}, null, true, 'America/Los_Angeles');
job.start();


// routes=====================================//

app.get('/', (req, res) => {
    res.render('index', {
        letters: JSON.stringify(puzzle.letters),
        validWords: JSON.stringify(puzzle.validWords),
        pangramBonus: PANGRAM_BONUS
    })
});

app.post('/update', (req, res) => {
    let words = req.cookies.words ? JSON.parse(req.cookies.words) : [];
    let score = scoreWords(puzzle.letters, words, puzzle.validWords);

    if (!req.cookies.userId) {
        let midnight = new Date();
        midnight.setHours(23, 59, 59, 0);
        let userId = createNewUser(leaderboardDB, words, score);
        res.cookie('userId', userId, { expires: midnight, sameSite: 'lax' });
        res.send({ score: score });
    } else {
        leaderboardDB.update({ userId: req.cookies.userId }, { $set: { date: new Date(), words: words, score: score } }, {}, () => {
            res.send({ score: score });
        });
    }
});

app.get('/leaderboard', (req, res) => {
    let thisUsersId = req.cookies.userId ? req.cookies.userId : "";
    leaderboardDB.find({ date: { $gt: today } }).sort({ score: -1, date: 1 }).exec((err, docs) => {
        res.render('leaderboard', {
            yesterdaysWinner: yesterday.winner,
            userId: thisUsersId,
            leaderboard: docs,
            showNickForm: (thisUsersId.length > 0)
        })
    })
});

app.post('/leaderboard', (req, res) => {
    let nick = req.body.username.replace(/[\/\\#,+()~%.'":*?<>{}]/g, '').slice(0, 25);
    let thisUsersId = req.cookies.userId ? req.cookies.userId : "";

    leaderboardDB.update({ userId: req.cookies.userId }, { $set: { nickname: nick } }, {}, () => {
        leaderboardDB.find({ date: { $gt: new Date(new Date().setHours(0, 0, 0, 0)) } }).sort({ score: -1, date: 1 }).exec((err, docs) => {
            res.render('leaderboard', {
                yesterdaysWinner: yesterday.winner,
                userId: thisUsersId,
                leaderboard: docs,
                showNickForm: (thisUsersId.length > 0)
            })
        })
    });

});

app.get('/yesterday', (req, res) => {
    res.render('yesterday', {
        words: JSON.stringify(yesterday.answers),
        letters: JSON.stringify(yesterday.letters)
    });
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
