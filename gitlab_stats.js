
const addTabButton = (onclick) => {
    const container = document.querySelector(".nav-sidebar ul")

    const button = document.createElement("a")
    button.classList.add("shortcuts-snippet")
    button.classList.add("gl-link")
    button.innerText = "📊  Statistics"
    button.onclick = onclick
    button.style.cursor = "pointer"

    const listItem = document.createElement("li")
    listItem.appendChild(button)

    container.appendChild(listItem)
}

const onReady = (server, token, projectId) => {
    console.log("READY", server, token, projectId)

    api = Gitlab({ token, host: server })
    api.request({ path: `/projects/${projectId}` }).then(console.log).catch(console.warn)

    // console.log(api, api.Projects)
}

const onGitlabServerRetrieved = (server) => {
    const bodyEl = document.querySelector("body")
    const projectId = bodyEl.getAttribute("data-project-id")
    if (projectId !== undefined) {
        browser.storage.local.get('gitlabToken').then((res) => {
            onReady(server, res.gitlabToken, projectId)
        });
    }
}

const setup = () => {
    browser.storage.local.get('gitlabServer').then((res) => {
        if (res.gitlabServer !== undefined && window.location.href.startsWith(res.gitlabServer)) {
            onGitlabServerRetrieved(res.gitlabServer)
        }
    });
}

setup()
