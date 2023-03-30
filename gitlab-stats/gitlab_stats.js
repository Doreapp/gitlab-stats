/*
Main script entrypoint for the addon
*/

/**
 * Build Statistics over given issues and add charts to the dialog
 * @param {HTMLElement} dialog Dialog element
 * @param {Object[]} issues List of Issues
 */
const buildIssuesStatistics = (dialog, issues) => {
    console.debug("Building statistics using..", issues)

    const issueCount = issues.length
    const issueClosedCount = issues.filter(issue => issue.closed_at !== null).length

    const container = document.createElement("div")
    container.innerHTML = `
    <ul>
        <li>Total number of issues: ${issueCount}</li>
        <li>Number of closed issues: ${issueClosedCount}</li>
    </ul>
    <div id="chartIssues"></div>
    `

    dialog.appendChild(container)

    const issuesCreated = {
        name: "Created issues",
        x: [],
        y: [],
        mode: 'lines'
    };
    let amount = 0
    for (let issue of issues.sort((i1, i2) => new Date(i1.created_at) - new Date(i2.created_at))) {
        issuesCreated.x.push(new Date(issue.created_at))
        issuesCreated.y.push(++amount)
    }

    const issuesClosed = {
        name: "Closed issues",
        x: [],
        y: [],
        mode: 'lines'
    };
    amount = 0
    for (let issue of issues.filter(issue => issue.closed_at !== null).sort((i1, i2) => new Date(i1.closed_at) - new Date(i2.closed_at))) {
        issuesClosed.x.push(new Date(issue.closed_at))
        issuesClosed.y.push(++amount)
    }

    const issuesOpen = {
        name: "Open issues",
        x: [],
        y: [],
        mode: 'lines'
    };
    const events = []
    for (let issue of issues) {
        events.push({type: "open", date: new Date(issue.created_at)})
        if (issue.closed_at !== null) {
            events.push({type: "close", date: new Date(issue.closed_at)})
        }
    }
    amount = 0
    for (let event of events.sort((e1, e2) => e1.date - e2.date)) {
        issuesOpen.x.push(event.date)
        if (event.type === "open") {
            amount++
        } else {
            amount--
        }
        issuesOpen.y.push(amount)
    }

    Plotly.newPlot('chartIssues', [issuesCreated, issuesClosed, issuesOpen], {title:'Opened/Closed issues across time'});
}

/**
 * Fill the dialog using Gitlab API with given project id
 * @param {HTMLElement} dialog Dialog element
 * @param {Object} api API Object
 * @param {number} projectId Id of the Gitlab project
 */
const populateDialog = (dialog, api, projectId) => {
    dialog.innerText = ""
    api.issues({projectId})
        .then(issues => {
            buildIssuesStatistics(dialog, issues)
        })
        .catch(error => {
            window.alert("Error fetching the project "+ error)
            console.error(error)
        })
}

/**
 * Create, add to the page and return the dialog element
 * @returns {HTMLElement} Dialog
 */
const addDialogElement = () => {
    const container = document.querySelector("body")

    const dialog = document.createElement("dialog")
    dialog.style.position = "fixed"
    dialog.style.left = "10%"
    dialog.style.top = "10%"
    dialog.style.width = "80%"
    dialog.style.height = "80%"
    dialog.style.backgroundColor = "rgb(41, 40, 45)"
    dialog.style.borderRadius = "5px"
    dialog.style.padding = "0"
    dialog.style.margin = "0"
    dialog.onclick = (e) => {
        if (e.target.nodeName === 'DIALOG') {
            dialog.close('dismiss')
        }
    }
    container.appendChild(dialog)

    const content = document.createElement("form")
    content.style.padding = "2em"
    content.method = "dialog"
    dialog.appendChild(content)

    content.show = (api, projectId) => {
        dialog.showModal()
        populateDialog(content, api, projectId)
    }

    return content
}

/**
 * Add the button as a tab of the project
 * @param {function} onclick Callback of tab button clicked
 */
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
