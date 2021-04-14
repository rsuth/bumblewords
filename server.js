import { dictionary } from './dictionary.js';
import { loggerMiddleware, getLetterSet, updateLeaderboard, scoreWords } from './utils.js';
import express from 'express';
import { CronJob } from 'cron';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import nedb from 'nedb';
import cookieParser from 'cookie-parser';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(loggerMiddleware);
app.set('view engine', 'pug');
app.set('views', path.join(path.resolve(), 'views'))

var letters = getLetterSet(dictionary);
var leaderboard = [];

var db = new nedb({ filename: path.join(path.resolve(), 'leaderboard.db'), autoload: true });
db.ensureIndex({ fieldName: 'userId', unique: true }, function (err) {
    if (err) { console.error(`nedb error ensureIndex: ${err}`); };
});

var job = new CronJob('0 0 * * *', () => {
    letters = getLetterSet(dictionary);
    leaderboard = [];
}, null, true, 'America/Los_Angeles');

job.start();

// routes=====================================//

app.get('/', (req, res) => {
    res.render('index', {
        letters: JSON.stringify(letters)
    })
});

function createNewUser(db, words, score) {
    let userId = uuidv4().slice(0, 8);
    db.insert({
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
    let score = scoreWords(letters, words, dictionary);
    
    if (!req.cookies.userId) {
        let midnight = new Date();
        midnight.setHours(23, 59, 59, 0);
        let userId = createNewUser(db, words, score);
        res.cookie('userId', userId, { expires: midnight });
    } else {
        db.update({ userId: req.cookies.userId }, { $set: { words: words } }, {}, () => {
            db.update({ userId: req.cookies.userId }, { $set: { score: score } });
        });
    }
    res.send({score: score});
});

app.get('/leaderboard', (req, res) => {
    let thisUsersId = req.cookies.userId ? req.cookies.userId : "";    
    db.find({date: { $gt: new Date(new Date().setHours(0,0,0,0))}}).sort({score: -1}).exec((err, docs)=>{
        res.render('leaderboard', {
            userId: thisUsersId,
            leaderboard: docs,
            showNickForm: (thisUsersId.length > 0)
        })
    })
});

app.post('/leaderboard', (req, res) => {
    let nick = req.body.username.replace(/[\/\\#,+()~%.'":*?<>{}]/g, '').slice(0,25);
    let thisUsersId = req.cookies.userId ? req.cookies.userId : "";    

    db.update({ userId: req.cookies.userId }, { $set: {nickname: nick }}, {}, ()=>{
        db.find({date: { $gt: new Date(new Date().setHours(0,0,0,0))}}).sort({score: -1}).exec((err, docs)=>{
            res.render('leaderboard', {
                userId: thisUsersId,
                leaderboard: docs,
                showNickForm: (thisUsersId.length > 0)
            })
        })
    });

});

app.listen(port, () => {
    console.log(`starting server on ${port}`);
});