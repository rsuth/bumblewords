import { readFileSync } from 'fs';

const shuffle = (array) => {
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
};

export const loadDictionary = (dictFile) => {
    var tmp = readFileSync(dictFile, 'utf8')
    return tmp.split('\n');
}

const letterGetter = (banned) => {
    let consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
    let vowels = ['A', 'E', 'I', 'O', 'U'];

    consonants = consonants.filter(letter => !banned.includes(letter));
    vowels = vowels.filter(letter => !banned.includes(letter));

    return shuffle(shuffle(consonants).slice(0, 5).concat(shuffle(vowels).slice(0, 2)));
};

export const getValidWords = (letters, dictionary) => {

    let re = new RegExp(`^[${letters.join('')}]+$`)

    let valid_words = dictionary.filter((word) => {
        return re.test(word) && word.includes(letters[6]);
    });

    return valid_words;

};

export const cookieMiddleware = (req, res, next) => {
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
};

export const loggerMiddleware = (req, res, next) => {
    var date = new Date();
    var isoDateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    var logString = `[${isoDateTime.slice(0, 19)}] ${req.method} ${req.originalUrl}`;
    if (req.cookies.userId) {
        logString += ` user:${req.cookies.userId}`;
    } else {
        logString += ` (anon user)`;
    }
    console.log(logString);
    next();
};

const scoreWord = (letters, word, pangramBonus) => {
    let score = 1
    if (word.length === 4) {
        return score;
    } else {
        score = word.length;
    }
    if (pangramDetector(letters, word)) {
        score += pangramBonus;
    }
    return score;
}


export const scoreWords = (letters, words, validWords) => {
    let score = words.reduce((acc, word) => {
        if (validWords.includes(word)) {
            return acc + scoreWord(letters, word, 7);
        }
    }, 0);
    return score;
}


const pangramDetector = (letters, word) => {
    var pangram = true;
    letters.forEach((letter) => {
        if (!word.includes(letter)) {
            pangram = false;
        }
    })
    return pangram;
};

// function to get a good letter set.
// Good means there are at least <minimumWords> valid words
// and at least one pangram and banned letters arent included.
export const getLetterSet = (dictionary, minimumWords, banned) => {
    let done = false;
    var letters = [];
    while (!done) {
        letters = letterGetter(banned);

        let validWords = getValidWords(letters, dictionary);
        let pangram = false;

        validWords.forEach((w, i) => {
            if (pangramDetector(letters, w)) {
                pangram = true;
            }
        });

        if (validWords.length > minimumWords && pangram) {
            done = true;
        }


        if (['I', 'N', 'G'].every(l => letters.includes(l))) {
            done = false;
        }

    }
    return letters;
};

export const updateLeaderboard = (name, score, leaderboard) => {
    if (leaderboard.some(e => e.name === name)) {
        leaderboard.forEach((e, i) => {
            if (e.name === name) {
                let parsedScore = parseInt(score);
                if (!Number.isNaN(parsedScore)) {
                    leaderboard[i].score = parsedScore;
                }
            }
        })

    } else {
        leaderboard.push({ name: name, score: parseInt(score) });
    }
    leaderboard.sort((a, b) => (a.score > b.score) ? -1 : 1);
    return leaderboard;
};