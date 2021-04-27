function pangramDetector(word) {
    var pangram = true;
    LETTERS.forEach((letter) => {
        if (!word.includes(letter)) {
            pangram = false;
        }
    })
    return pangram;
}

function renderFoundWords() {
    var foundEl = document.getElementById('yesterday-wordlist');
    foundEl.innerHTML = "";
    WORDS.forEach((w, i) => {
        let html = "";
        for(let i = 0; i < w.length; i++){
            if(w[i] === LETTERS[6]){
                html += `<span style="color:#fcd703">${w[i]}</span>`; 
            } else {
                html += w[i];
            }
        }
        if(pangramDetector(w)){
            html = `✨${html}✨`
        }
        var li = document.createElement('li');
        li.innerHTML = html;
        foundEl.appendChild(li);
    })
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '');
};

var darkMode = getCookie('darkMode') ? parseInt(getCookie('darkMode')) : 0;
renderFoundWords();

document.addEventListener("DOMContentLoaded", () => {
    if(darkMode !== 0){
        document.body.classList.add('darkMode');
    }
})