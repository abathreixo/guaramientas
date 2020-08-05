import {FiefData, TroopData, XYPair} from "../dataContainers";


export async function get_html_response(location: XYPair): Promise<string> {
    const url = `/web/vercasilla.php?vistax=${location.x}&vistay=${location.y}`;
    let request = await fetch(url);
    return await request.text();
}


function extract_troop_ids(html_response: string): number[] {
    let sub_strings = html_response.match(/'idgrupodividir'.{9}\d+/g);
    let result = [];
    sub_strings.forEach(value => result.push(parseInt(value.substring(25))));
    return result;
}


function extract_troop_size(html_response: string, troop_id: number): number {
    let first_index = html_response.search('tropa' + troop_id);
    let length = html_response.substring(first_index).search('icon_dividir');
    let size_line = html_response.substr(first_index, length).match('textospequeamarillo\"\>[0-9]+').toString();
    let size = size_line.match('[0-9]+').toString();
    return parseInt(size);
}


export async function read_fief(location: XYPair): Promise<FiefData> {
    let response = await get_html_response(location);
    let troop_ids = extract_troop_ids(response);
    let troops = new Map<number, TroopData>();
    troop_ids.forEach(troop_id => {
        let size = extract_troop_size(response, troop_id);
        troops.set(troop_id, new TroopData(size));
    });
    return new FiefData(location, troops);
}
