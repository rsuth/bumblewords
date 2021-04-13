function setCookie(name, value, days = 1, path = '/') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=' + path
}

document.addEventListener('DOMContentLoaded', function (evt) {
    if (document.querySelector('#name-form')) {
        document.querySelector('#name-form').addEventListener('submit', function (evt) {
            setCookie('username', document.querySelector('#username').value, 1);
        })
    }
})