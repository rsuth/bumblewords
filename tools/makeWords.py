goodwords = []
with open('wordlist.txt') as wordlist:
    for w in wordlist:
        if len(w.rstrip()) > 3:
            goodwords.append(w.rstrip().upper())

with open('words.js', 'w+') as out:
    out.write('const words = [')
    for w in goodwords:
        out.write(f'\"{w}\", ')
    out.write('];')


