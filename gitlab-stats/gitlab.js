/*
Utilities to use Gitlab API
*/

const Gitlab = ({ token, host = "https://gitlab.com" }) => {
    const request = async ({ path, method = "GET" }) => {
        console.debug(method, "on", `${host}/api/v4${path}`)
        const response = await fetch(
            `${host}/api/v4${path}`,
            {
                headers: new Headers({ 'PRIVATE-TOKEN': token })
            }
        )
        return await response.json()
    }

    const projectIssues =  async ({ projectId }) => {
        let lastResponseCount = 100
        let results = []
        let page = 1
        while (lastResponseCount === 100) {
            const issues = await request({path: `/projects/${projectId}/issues?page=${page}&per_page=100`})
            lastResponseCount = issues.length
            results = results.concat(issues)
            page++
        }
        return results
    }

    const projectMergeRequests =  async ({ projectId }) => {
        let lastResponseCount = 100
        let results = []
        let page = 1
        while (lastResponseCount === 100) {
            const issues = await request({path: `/projects/${projectId}/merge_requests?page=${page}&per_page=100`})
            lastResponseCount = issues.length
            results = results.concat(issues)
            page++
        }
        return results
    }

    return {
        request,
        projectIssues,
        projectMergeRequests
    }
}
