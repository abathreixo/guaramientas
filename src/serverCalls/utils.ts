import {XYPair} from "../dataContainers";


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


export function clean_string(input: string, removed: string[]): string {
    let result = input;
    for (let char of removed) {
        let regex = RegExp(char, 'g');
        result = result.replace(regex, '');
    }
    return result;
}


export function parse_integer(input: string): number {
    return parseInt(clean_string(input, ['\\.', '\ ']));
}


export function parse_coordinates(input: string): XYPair | null {
    const cleaned = clean_string(input, ['\ ', '\n', '\t']);
    if ('No' == cleaned) return null;
    const coordinates = cleaned.split('-');
    return new XYPair(parse_integer(coordinates[0]), parse_integer(coordinates[1]));
}


export function parse_dom(response: string, type: SupportedType='text/html'): Document {
    let parser = new DOMParser();
    return parser.parseFromString(response, type);
}


export function parse_html_table(table: HTMLElement): HTMLElement[][] {
    let result = [];
    for (let row of table.children) {
        if ('TR' != row.tagName) continue;
        let cells = [];
        for (let cell of row.children) {
            if ('TD' != cell.tagName) continue;
            cells.push(cell);
        }
        result.push(cells);
    }
    return result;
}
