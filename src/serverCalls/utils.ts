export class ServerCallUtils {
    static async fetch_wrapper(url: string, parameters: Object, method: string): Promise<Response> {
        let body = '';

        for (let key in parameters) {
            if (body.length > 0) body += '&';
            body += key + '=' + parameters[key];
        }

        return await fetch(url, {
            method: method,
            body: body,
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            }
        });
    }

    static async post(url: string, parameters: Object): Promise<Response> {
        return ServerCallUtils.fetch_wrapper(url, parameters, 'POST');
    }
}
