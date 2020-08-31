import {XYPair} from "../../models/XYPair";
import {TerrainType} from "../../utils/types";
import {TerrainTypes} from "../../models/Fief";


export function removeCharacters(input: string, removed: string[]): string {
    let result = input;
    for (let char of removed) {
        let regex = RegExp(char, 'g');
        result = result.replace(regex, '');
    }
    return result;
}


export function removeBlanks(input: string): string {
    return removeCharacters(input, ['\ ', '\t', '\n']);
}


export function parseInteger(input: string): number {
    return parseInt(removeCharacters(input, ['\\.', '\ ']));
}


export function parseCoordinates(input: string): XYPair {
    const cleaned = removeBlanks(input);
    if ('No' == cleaned) return null;
    const coordinates = cleaned.split('-');
    return new XYPair(parseInteger(coordinates[0]), parseInteger(coordinates[1]));
}


export function parseDom(response: string, type: SupportedType='text/html'): Document {
    let parser = new DOMParser();
    return parser.parseFromString(response, type);
}


export function parseHtmlTable(table: HTMLElement): HTMLElement[][] {
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


export function getTerrainType(text: string): TerrainType {
    const cleanText = removeBlanks(text);
    const mapping = new Map([
        ['Costa', TerrainTypes.COAST],
        ['Llanura', TerrainTypes.PLAINS],
        ['Río', TerrainTypes.RIVER],
        ['Bosque', TerrainTypes.FOREST],
        ['Pantano', TerrainTypes.SWAMP],
        ['Montaña', TerrainTypes.MOUNTAIN],
        ['Desierto', TerrainTypes.DESERT]
    ]);
    if (mapping.has(cleanText)) return mapping.get(cleanText);
    return TerrainTypes.SEA;
}


export function parseIncome(text: string): number {
    const cleanText = removeBlanks(text);
    if (cleanText === 'Exento') return -1;
    return parseInteger(cleanText);
}
