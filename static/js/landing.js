const codeInput = document.querySelector("#inputCode");

document.forms[0].onsubmit = function setCookie() {

    const date = new Date();
    date.setTime(date.getTime() + (30*24*60*60*1000));
    const code = document.querySelector("#inputCode").value
    document.cookie = `code=${ code }; expires=${ date.toUTCString() }; path=/`;

}

window.onload = function() {
    const code = document.cookie.split("=")[1];
    if (code) {
        codeInput.value = code;
    }
}