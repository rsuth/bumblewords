import nedb from 'nedb';
import path from 'path';


var ldb = new nedb({
    filename: path.join(path.resolve(), 'leaderboard.db'),
    autoload: true
});


ldb.find({}).sort({ date: 1 }).exec(function (err, docs) {
    for (let i = 0; i < docs.length; i++) {
        if (docs[i].nickname !== 'anonymous user') {
            console.log(`${docs[i].date}: ${docs[i].score} - ${docs[i].nickname}`);
        }
    }
});