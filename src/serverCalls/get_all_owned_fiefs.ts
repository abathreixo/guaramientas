import {clean_string, parse_coordinates, parse_dom, parse_html_table, parse_integer} from "./utils";
import {FiefData, TroopData} from "../dataContainers";

async function fetch_html_data(): Promise<string> {
    const url = `/web/tusfeudos.php?&vertodo=1`;
    let request = await fetch(url);
    return await request.text();
}


function is_valid_fief_row(row: HTMLElement[]): boolean {
    if (15 != row.length) return null;
    if (! row[0].className) return null;
    return true;
}


function parse_fief_row(row: HTMLElement[]): FiefData | null {
    if ( ! is_valid_fief_row(row) ) return null;
    const terrain = (row[0].children[0] as HTMLImageElement).title;
    const location = parse_coordinates(row[1].innerText);
    const children = parse_integer(row[2].innerText);
    const men = parse_integer(row[4].innerText);
    const women = parse_integer(row[5].innerText);
    const total = parse_integer(row[6].innerText);
    const elders = total - men - women - children;
    const farms = parse_integer(row[7].innerText);
    const villages = parse_integer(row[8].innerText);
    const last_harvest = parse_integer(row[12].innerText);
    const reserves = parse_integer(row[13].innerText);
    const rebellious = row[13].children.length > 1;
    return new FiefData(location, terrain, children, men, women, elders, farms, villages, last_harvest, reserves, rebellious);
}


export async function get_all_owned_fiefs(): Promise<FiefData[]> {
    let response = await fetch_html_data();
    let doc = parse_dom(response);
    let table = doc.querySelector("#tusfeudos > table > tbody > tr > td > table > tbody") as HTMLElement;
    let data = parse_html_table(table);
    let result = [];
    for (let row of data) {
        let fief_data = parse_fief_row(row);
        if (fief_data) result.push(fief_data);
    }
    return result;
}
