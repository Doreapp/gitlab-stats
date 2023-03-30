(() => {
    let gitlabServer, gitlabToken;

    const displayIssueStatistics = ({openCount, closedCount, unknownCount}) => {
        document.querySelector("#issue-opened-value").innerText = openCount
        document.querySelector("#issue-closed-value").innerText = closedCount
        if (unknownCount > 0) {
            document.querySelector("#issue-unknown-value").innerText = unknownCount
            document.querySelector("#issue-unknown").style.display = ""
        }
        document.querySelector("#issue-statistics").style.display = "";
    }

    const buildIssueStatistics = async (api, me) => {
        const issues = await api.issues({assigneeId: me.id});
        console.log(issues)

        let openCount = 0, closedCount = 0, unknownCount = 0;
        for (const issue of issues) {
            switch (issue.state) {
                case "opened":
                    openCount++;
                    break;
                case "closed":
                    closedCount++;
                    break;
                default:
                    console.warn("Unknown issue state", issue.state, "from", issue)
                    unknownCount++;
            }
        }

        displayIssueStatistics({openCount, closedCount, unknownCount})
    }

    const displayMergeRequestStatistics = ({openCount, closedCount, mergedCount, unknownCount}) => {
        document.querySelector("#merge-request-opened-value").innerText = openCount
        document.querySelector("#merge-request-closed-value").innerText = closedCount
        document.querySelector("#merge-request-merged-value").innerText = mergedCount
        if (unknownCount > 0) {
            document.querySelector("#merge-request-unknown-value").innerText = unknownCount
            document.querySelector("#merge-request-unknown").style.display = ""
        }
        document.querySelector("#merge-request-statistics").style.display = "";
    }

    const buildMergeRequestStatistics = async (api, me) => {
        const mergeRequests = await api.mergeRequests({assigneeId: me.id});

        let openCount = 0, closedCount = 0, mergedCount = 0, unknownCount = 0;
        for (const mergeRequest of mergeRequests) {
            switch (mergeRequest.state) {
                case "opened":
                    openCount++;
                    break;
                case "merged":
                    mergedCount++;
                    break;
                case "closed":
                    closedCount++;
                    break;
                default:
                    console.warn("Unknown merge request state", mergeRequest.state, "from", mergeRequest)
                    unknownCount++;
            }
        }

        displayMergeRequestStatistics({openCount, closedCount, mergedCount, unknownCount})
    }

    const setupUserDisplay = () => {
        api = Gitlab({host: gitlabServer, token: gitlabToken})
        api.me().then(me => {
            console.log(me)
            buildMergeRequestStatistics(api, me)
            buildIssueStatistics(api, me)
        })
    }

    const setupSettings = () => {
        const dialog = document.querySelector("dialog#settings-container")
        document.querySelector("#option-settings").onclick = () => {
            dialog.querySelector("#server").value = gitlabServer || 'https://gitlab.com';
            dialog.querySelector("#token").value = gitlabToken || "";
            dialog.showModal()
        }
        dialog.onclick = (e) => {
            if (e.target.nodeName === 'DIALOG') {
                dialog.close('dismiss')
            }
        }

        dialog.querySelector("form").addEventListener("submit", (e) => {
            e.preventDefault()
            saveOptions()
            dialog.close('dismiss')
        });

        function saveOptions() {
            browser.storage.local.set({
                gitlabServer: document.querySelector("#server").value,
                gitlabToken: document.querySelector("#token").value
            });
            location.reload()
        }
    }

    setupSettings()

    const onReady = () => {
        if (gitlabServer && gitlabToken) {
            setupUserDisplay()
        }
    }

    browser.storage.local.get('gitlabServer').then((res) => {
        gitlabServer = res.gitlabServer || 'https://gitlab.com';
        onReady()
    });
    browser.storage.local.get('gitlabToken').then((res) => {
        gitlabToken = res.gitlabToken || "";
        onReady()
    });
})()
