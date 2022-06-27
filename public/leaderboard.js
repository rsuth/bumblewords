function setCookie(name, value, exp, path = '/') {
    if (exp) {
        const expires = exp.toUTCString();
        document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=' + path + '; SameSite=Lax';
    } else {
        document.cookie = name + '=' + encodeURIComponent(value) + '; path=' + path + '; SameSite=Lax';
    }
};

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '');
};

var darkMode = getCookie('darkMode') ? parseInt(getCookie('darkMode')) : 0;

function toggleDarkMode() {

    darkMode ^= true;
    setCookie('darkMode', darkMode);

    if (darkMode) {
        document.body.classList.add('darkMode');
        document.querySelector('#darkmode-toggle').textContent = 'light mode';
    } else {
        document.body.classList.remove('darkMode');
        document.querySelector('#darkmode-toggle').textContent = 'dark mode';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (darkMode !== 0) {
        document.body.classList.add('darkMode');
        document.querySelector('#darkmode-toggle').textContent = 'light mode';
    }
    document.querySelector('#darkmode-toggle').addEventListener('click', toggleDarkMode);
})