/*
background-color: red;
position: fixed;
left: 0;
right: 0;
top: 0;
bottom: 0;
margin: 5em;
border-radius: 5px;
width: 100%;
*/
const buildIssuesStatistics = (dialog, issues) => {
    console.log(issues)

    const issueCount = issues.length
    const issueClosedCount = issues.filter(issue => issue.closed_at !== null).length

    const container = document.createElement("div")
    container.innerHTML = `
    <ul>
        <li>Total number of issues: ${issueCount}</li>
        <li>Number of closed issues: ${issueClosedCount}</li>
    </ul>
    `

    dialog.appendChild(container)
}

const populateDialog = (dialog, api, projectId) => {
    dialog.innerText = ""
    api.projectIssues({projectId})
        .then(issues => {
            buildIssuesStatistics(dialog, issues)
        })
        .catch(error => {
            window.alert("Error fetching the project "+ error)
            console.error(error)
        })
}

const addDialogElement = () => {
    const container = document.querySelector("body")

    const dialogBack = document.createElement("div")
    dialogBack.style.position = "fixed"
    dialogBack.style.left = 0
    dialogBack.style.width = "100%"
    dialogBack.style.top = 0
    dialogBack.style.height = "100%"
    dialogBack.style.zIndex = 999
    dialogBack.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
    dialogBack.style.display = "none"
    container.appendChild(dialogBack)
    dialogBack.onclick = () => {
        dialogBack.style.display = "none"
    }

    const dialog = document.createElement("div")
    dialog.style.margin = "10%"
    dialog.style.width = "80%"
    dialog.style.height = "80%"
    dialog.style.backgroundColor = "rgb(41, 40, 45)"
    dialog.style.borderRadius = "5px"
    dialog.style.padding = "2em"
    dialogBack.appendChild(dialog)

    dialog.show = (api, projectId) => {
        dialogBack.style.display = "block"
        populateDialog(dialog, api, projectId)
    }

    dialog.hide = () => {
        dialogBack.style.display = "none"
    }

    return dialog
}


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
    const dialog = addDialogElement()
    const api = Gitlab({ token, host: server })

    addTabButton(() => {
        dialog.show(api, projectId)
    })
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
