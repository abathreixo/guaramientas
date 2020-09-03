export async function post(url: string, ...parameters: Object[]): Promise<Response> {
    let body = '';

    for (let payload of parameters) {
        for (let key in payload) {
            if (body.length > 0) body += '&';
            body += key + '=' + payload[key];
        }
    }

    const request = await fetch(url, {
        method: 'POST',
        body: body,
        headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        }
    });
    await request.text();
    return request;
}
