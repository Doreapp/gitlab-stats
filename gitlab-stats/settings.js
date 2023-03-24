function saveOptions(event) {
    browser.storage.local.set({
        gitlabServer: document.querySelector("#server").value,
        gitlabToken: document.querySelector("#token").value
    });
    event.preventDefault();
}

function restoreOptions() {
    browser.storage.local.get('gitlabServer').then((res) => {
        document.querySelector("#server").value = res.gitlabServer || 'https://gitlab.com';
    });
    browser.storage.local.get('gitlabToken').then((res) => {
        document.querySelector("#token").value = res.gitlabToken || "";
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
