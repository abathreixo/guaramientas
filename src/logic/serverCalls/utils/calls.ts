export async function post(url: string, parameters: Object, awaitForResponse: boolean=true): Promise<Response> {
    let body = '';

    for (let key in parameters) {
        if (body.length > 0) body += '&';
        body += key + '=' + parameters[key];
    }

    const request = await fetch(url, {
        method: 'POST',
        body: body,
        headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    });
    if (awaitForResponse) await request.text();
    return request;
}
