export async function post(url: string, parameters: Object): Promise<Response> {
    let body = '';

    for (let key in parameters) {
        if (body.length > 0) body += '&';
        body += key + '=' + parameters[key];
    }

    return await fetch(url, {
        method: 'POST',
        body: body,
        headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    });
}
