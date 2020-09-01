import {Fief} from "../../models/Fief";
import {getTerrainType, parseCoordinates, parseDom, parseHtmlTable, parseIncome, parseInteger} from "../utils/parsing";
import {FiefSet} from "../../fiefSet/FiefSet";


async function fetchOwnedFiefsDataAsHtmlResponse(): Promise<string> {
    const url = `/web/tusfeudos.php?&vertodo=1`;
    let request = await fetch(url);
    return await request.text();
}


function isValidFiefRow(row: HTMLElement[]): boolean {
    if (15 != row.length) return null;
    if (! row[0].className) return null;
    return true;
}


function parseFiefRow(row: HTMLElement[]): Fief {
    if ( ! isValidFiefRow(row) ) return null;
    const terrain = getTerrainType((row[0].children[0] as HTMLImageElement).title);
    const location = parseCoordinates(row[1].innerText);
    const children = parseInteger(row[2].innerText);
    const men = parseInteger(row[4].innerText);
    const women = parseInteger(row[5].innerText);
    const total = parseInteger(row[6].innerText);
    const elders = total - men - women - children;
    const farms = parseInteger(row[7].innerText);
    const villages = parseInteger(row[8].innerText);
    const lastHarvest = parseInteger(row[12].innerText);
    const reserves = parseInteger(row[13].innerText);
    const rebellious: boolean = row[13].children.length > 1;
    const income = parseIncome(row[14].innerText);

    return new Fief(
        location, terrain, children, men, women, elders, farms, villages,
        lastHarvest, reserves, rebellious, income,
        null, null
    );
}


export async function readAllOwnedFiefs(): Promise<FiefSet> {
    let response = await fetchOwnedFiefsDataAsHtmlResponse();
    let doc = parseDom(response);
    let table = doc.querySelector("#tusfeudos > table > tbody > tr > td > table > tbody") as HTMLElement;
    let data = parseHtmlTable(table);
    let result = new FiefSet([]);
    for (let row of data) {
        let fief = parseFiefRow(row);
        if (fief) result.add(fief);
    }
    return result;
}
