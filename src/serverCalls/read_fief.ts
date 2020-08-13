import {TroopData, XYPair, CompleteFiefData} from "../dataContainers";
import {clean_string, parse_coordinates, parse_dom, parse_html_table, parse_integer} from "./utils";


function is_valid_troop_row(row: HTMLElement[]): boolean {
    if (8 != row.length) return false;
    if (1 != row[1].children.length) return false;
    let troop_type = row[1];
    return troop_type.children[0].getAttribute('for').startsWith('tropa');
}


function parse_troop_row(row: HTMLElement[]): TroopData | null {
    if ( ! is_valid_troop_row(row) ) return null;
    const id = parse_integer(row[1].children[0].getAttribute('for').substring(5));
    const type = parse_integer(row[1].children[0].children[0].getAttribute('src').match('[0-9]+').toString());
    const amount = parse_integer(row[2].children[0].children[0].innerHTML);
    const power = parse_integer(row[4].innerText);
    const skill = parse_integer(row[5].innerText);
    const morale = parse_integer(row[6].innerText);
    const destination = parse_coordinates(row[7].innerText);
    return new TroopData(id, type, amount, power, skill, morale, destination);
}


function parse_own_troops(table: HTMLElement): Map<number, TroopData> {
    let data = parse_html_table(table);
    let result = new Map<number, TroopData>();
    for (let row of data) {
        let troop_data = parse_troop_row(row);
        if (troop_data) result.set(troop_data.id, troop_data);
    }
    return result;
}


function extract_span_text(base_element: Element, selectors: string): string {
    return (base_element.querySelector(selectors) as HTMLSpanElement).innerText;
}


function extract_span_number(base_element: Element, selectors: string): number {
    return parse_integer(extract_span_text(base_element, selectors));
}


async function fetch_html_data(location: XYPair): Promise<string> {
    const url = `/web/vercasilla.php?vistax=${location.x}&vistay=${location.y}`;
    let request = await fetch(url);
    return await request.text();
}


export async function read_fief(location: XYPair): Promise<CompleteFiefData> {
    let response = await fetch_html_data(location);
    let doc = parse_dom(response);

    const data = doc.querySelector("#parte_inicial > table.textos > tbody");
    const geography = data.querySelector("tr:nth-child(1) > td:nth-child(2)");
    const terrain = clean_string(extract_span_text(geography,"span:nth-child(16)"), ['\ ', '\n', '\t']);

    const population = data.querySelector("tr:nth-child(2) > td:nth-child(1)");
    const children = extract_span_number(population, "span:nth-child(3)");
    const men = extract_span_number(population, "span:nth-child(5)");
    const women = extract_span_number(population, "span:nth-child(7)");
    const elders = extract_span_number(population, "span:nth-child(9)");

    const economy = data.querySelector("tr:nth-child(2) > td:nth-child(2)");
    const farms = extract_span_number(economy, "#A-" + location.x + "-" + location.y);
    const villages = extract_span_number(economy,"#U-" + location.x + "-" + location.y);

    const n_economy_children = economy.children.length;
    let offset = 20 == n_economy_children ? 4 : n_economy_children == 19 ? 2: 0;
    const reserves = extract_span_number(economy, `span:nth-child(${12 + offset})`);
    const last_harvest = extract_span_number(economy, `span:nth-child(${13 + offset})`);
    const rebellious = null != economy.querySelector(`img:nth-child(${14 + offset})`);
    const displayed_quality_of_life = extract_span_number(economy, `span:nth-child(${16 + offset})`);

    const troops_element = doc.getElementById('checkcambiatodos').parentElement.parentElement.parentElement;
    const own_troops = parse_own_troops(troops_element);

    return new CompleteFiefData(
        location, terrain, children, men, women, elders, farms, villages,
        last_harvest, reserves, rebellious, own_troops, displayed_quality_of_life
    );
}
