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

    const issues = async ({ projectId=undefined, assigneeId=undefined }) => {
        let baseUrl = ""
        if (projectId) {
            baseUrl += `/projects/${projectId}`
        }
        baseUrl += "/issues"
        let queryArguments = ["per_page=100"]
        if (assigneeId) {
            queryArguments.push(`assignee_id=${assigneeId}`)
        }
        let lastResponseCount = 100
        let results = []
        let page = 1
        while (lastResponseCount === 100) {
            const issues = await request({path: `${baseUrl}?page=${page}&` + queryArguments.join("&")})
            lastResponseCount = issues.length
            results = results.concat(issues)
            page++
        }
        return results
    }

    const mergeRequests = async ({ projectId=undefined, assigneeId=undefined }) => {
        let baseUrl = ""
        if (projectId) {
            baseUrl += `/projects/${projectId}`
        }
        baseUrl += "/merge_requests"
        let queryArguments = ["per_page=100"]
        if (assigneeId) {
            queryArguments.push( `assignee_id=${assigneeId}`)
        }
        let lastResponseCount = 100
        let results = []
        let page = 1
        while (lastResponseCount === 100) {
            const mergeRequests = await request({path: `${baseUrl}?page=${page}&` + queryArguments.join("&")})
            lastResponseCount = mergeRequests.length
            results = results.concat(mergeRequests)
            page++
        }
        return results
    }

    const me = async () => {
        return await request({path: "/user"})
    }

    return {
        request,
        issues,
        mergeRequests,
        me
    }
}
