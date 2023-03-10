const Gitlab = ({ token, host = "https://gitlab.com" }) => {
    console.log("init Gitlab", host)

    const request = async ({ path, method = "GET" }) => {
        const response = await fetch(
            `${host}/api/v4${path}/issues`,
            {
                headers: new Headers({ 'PRIVATE-TOKEN': token })
            }
        )
        return await response.json()
    }

    return {
        request
    }
}
