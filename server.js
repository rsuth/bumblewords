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

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(loggerMiddleware);
app.set('view engine', 'pug');
app.set('views', path.join(path.resolve(), 'views'))

console.log(`Starting server...`);

var today = new Date();
var yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(0, 0, 0, 0);
today.setHours(0, 0, 0, 0);

console.log(`todays date: ${today}, yesterdays date: ${yesterday}`);

console.log(`creating database interfaces...`);
var leaderboardDB = new nedb({ filename: path.join(path.resolve(), 'leaderboard.db'), autoload: true });
leaderboardDB.ensureIndex({ fieldName: 'userId', unique: true }, function (err) {
    if (err) { console.error(`nedb error ensureIndex: ${err}`); };
});
var puzzleDB = new nedb({ filename: path.join(path.resolve(), 'puzzle.db'), autoload: true });

var letters;
var yesterdaysWinner;
var yesterdaysAnswers;
var yesterdaysPuzzle;
var validWords;

// look for a puzzle with todays date in puzzleDB.
puzzleDB.findOne({ date: { $gte: today } }, (err, doc) => {
    if (doc) {
        console.log(`Found puzzle created today: ${doc.letters}`);
        letters = doc.letters;
    } else {
        letters = getLetterSet(dictionary, MIN_VALID_WORDS);
        console.log(`New puzzle created: ${letters}`);
        puzzleDB.insert({ date: new Date(), letters: letters });
    }
    validWords = getValidWords(letters, dictionary);
});

// look for yesterdays winner in leaderboardDB
leaderboardDB.find({ date: { $gt: yesterday, $lt: today } })
    .sort({ score: -1 }).exec((err, docs) => {
        if (docs[0]) {
            yesterdaysWinner = { nickname: docs[0].nickname, score: docs[0].score };
        } else {
            yesterdaysWinner = { nickname: "", score: 0 };
        }
        console.log(`found yesterdays winner: ${yesterdaysWinner.nickname}`);
    });

// find yesterdays puzzle and Answers:
puzzleDB.findOne({ date: { $gte: yesterday, $lt: today } }, (err, doc) => {
    if (doc) {
        yesterdaysPuzzle = doc.letters;
        yesterdaysAnswers = getValidWords(doc.letters, dictionary);
        console.log(`found yesterdays puzzle: ${doc.letters} (${yesterdaysAnswers.length} words)`)
    } else {
        yesterdaysPuzzle = [];
        yesterdaysAnswers = [];
        console.log('could not find yesterdays puzzle');
    }
});

var job = new CronJob('0 0 * * *', () => {
    console.log(`Creating new puzzle...`);
    // reset today and yesterday
    today = new Date();
    yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    console.log(`todays date: ${today}, yesterdays date: ${yesterday}`);

    letters = getLetterSet(dictionary, MIN_VALID_WORDS);
    validWords = getValidWords(letters, dictionary);

    console.log(`New puzzle created: ${letters}`);

    puzzleDB.insert({ date: today, letters: letters });
    
    // find yesterdaysWinner:
    leaderboardDB.find({ date: { $gt: yesterday, $lt: today } })
        .sort({ score: -1 }).exec((err, docs) => {
            if (docs) {
                yesterdaysWinner = { nickname: docs[0].nickname, score: docs[0].score };
            } else {
                yesterdaysWinner = { nickname: "", score: 0 };
            }
            console.log(`found yesterdays winner: ${yesterdaysWinner.nickname}`);
        });
    
    // find yesterdaysAnswers:
    puzzleDB.findOne({ date: { $gte: yesterday, $lt: today } }, (err, doc) => {
        if (doc) {
            yesterdaysAnswers = getValidWords(doc.letters, dictionary);
        } else {
            yesterdaysAnswers = [];
        }
    });
}, null, true, 'America/Los_Angeles');

job.start();


// routes=====================================//

app.get('/', (req, res) => {
    res.render('index', {
        letters: JSON.stringify(letters),
        validWords: JSON.stringify(validWords),
        pangramBonus: PANGRAM_BONUS
    })
});

function createNewUser(leaderboardDB, words, score) {
    let userId = uuidv4().slice(0, 8);
    leaderboardDB.insert({
        date: new Date(),
        userId: userId,
        nickname: 'anonymous user',
        words: words,
        score: score
    });
    return userId
}

app.post('/update', (req, res) => {
    let words = req.cookies.words ? JSON.parse(req.cookies.words) : [];
    let score = scoreWords(letters, words, validWords);

    if (!req.cookies.userId) {
        let midnight = new Date();
        midnight.setHours(23, 59, 59, 0);
        let userId = createNewUser(leaderboardDB, words, score);
        res.cookie('userId', userId, { expires: midnight, sameSite: 'lax' });
    } else {
        leaderboardDB.update({ userId: req.cookies.userId }, { $set: { words: words, score: score } }, {}, () => {
            res.send({ score: score });
        });
    }
});

app.get('/leaderboard', (req, res) => {
    let thisUsersId = req.cookies.userId ? req.cookies.userId : "";
    leaderboardDB.find({ date: { $gt: today } }).sort({ score: -1 }).exec((err, docs) => {
        res.render('leaderboard', {
            yesterdaysWinner: yesterdaysWinner,
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
        leaderboardDB.find({ date: { $gt: new Date(new Date().setHours(0, 0, 0, 0)) } }).sort({ score: -1 }).exec((err, docs) => {
            res.render('leaderboard', {
                yesterdaysWinner: yesterdaysWinner,
                userId: thisUsersId,
                leaderboard: docs,
                showNickForm: (thisUsersId.length > 0)
            })
        })
    });

});

app.get('/yesterday', (req, res) => {
    res.render('yesterday', {
        words: JSON.stringify(yesterdaysAnswers),
        letters: JSON.stringify(yesterdaysPuzzle)
    });
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});
