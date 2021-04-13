# Bumblewords
## a browser spelling game

Create as many (> 3 letter) words as you can, using the given letters.

All words must include the middle letter in yellow and exist in the scrabble dictionary.

TODO:
- [x] save game progress (found words) in a cookie.
- [x] fix layout to be mobile friendly
- [ ] dictionary is missing some pretty common words - find new dictionary
- [x] add high score page
- [ ] BUG: usernames are encoded on client (spaces show up as %20, etc.)
- [ ] BUG: cookies persist accross new puzzles (stop using cookies for score - calculate score and check found words against valid words on each refresh, or don't worry about score - calculate it on server from found words)
- [ ] BUG: leaderboard doesnt update live - ajax in background on successful word to update score?
- [ ] FEATURE: leaderboard and letters are stored in memory - database? textfile on server? (overkill?)
- [ ] FEATURE: login/user accounts? game history/charting (too much hassle)?
- [ ] REFACTOR: code/logic is quick and dirty, needs validation, code is inconsistant, lots of global variables
