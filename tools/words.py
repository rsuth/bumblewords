goodwords = []
with open('wordlist.txt') as wordlist:
    for w in wordlist:
        if len(w.rstrip()) > 3:
            goodwords.append(w.rstrip())

with open('words.txt', 'w+') as out:
    for w in goodwords:
        out.write(f'\"{w}\", ')


