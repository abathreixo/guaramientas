import {Troop} from "../../models/Troop";
import {
    getTerrainType,
    parseCoordinates,
    parseDom,
    parseHtmlTable,
    parseIncome,
    parseInteger
} from "../utils/parsing";
import {XYPair} from "../../models/XYPair";
import {Fief} from "../../models/Fief";
import {Army} from "../../models/Army";
import {TerrainType} from "../../utils/types";


async function fetchFiefDataAsHtmlResponse(location: XYPair): Promise<string> {
    const url = `/web/vercasilla.php?vistax=${location.x}&vistay=${location.y}`;
    let request = await fetch(url);
    return await request.text();
}


function getNodeContaining(pattern: string, nodes: NodeList, nextSiblings: number=0): Node {
    for (let node of nodes) {
        const value = node.nodeValue;
        if (value && -1 != node.nodeValue.search(pattern)) {
            let result = node;
            for (let i = 0; i < nextSiblings; ++i) result = result.nextSibling;
            return result;
        }
    }
    return null;
}


function getTableValue(label: string, nodes: NodeList, nextSiblings: number=1): string {
    const node = getNodeContaining(label, nodes, nextSiblings);
    if (null === node) return null;
    return (node as HTMLElement).innerText;
}


function getTableNumber(label: string, nodes: NodeList, nextSiblings: number=1): number {
    return parseInteger(getTableValue(label, nodes, nextSiblings));
}


class Geography {
    constructor(
        public terrain: TerrainType
    ) {
    }

    public static fromHtmlElement(baseElement: HTMLElement): Geography {
        return new Geography(this.getTerrain(baseElement));
    }

    private static getTerrain(baseElement: HTMLElement): TerrainType {
        return getTerrainType(getTableValue('Terreno:', baseElement.childNodes));
    }
}


class Population {
    constructor(
        public children: number,
        public men: number,
        public women: number,
        public elders: number
    ) {
    }

    public static fromHtmlElement(baseElement: HTMLElement): Population {
        const nodes = baseElement.childNodes;
        const children = getTableNumber('Niños:', nodes);
        const men = getTableNumber('Hombres:', nodes);
        const women = getTableNumber('Mujeres:', nodes);
        const elders = getTableNumber('Ancianos:', nodes);
        return new Population(children, men,women,elders);
    }
}


class Economy {
    constructor(
        public farms: number,
        public villages: number,
        public reserves: number,
        public lastHarvest: number,
        public isRebellious: boolean,
        public income: number,
        public qualityOfLife: number
    ) {
    }

    public static fromHtmlElement(baseElement: HTMLElement): Economy {
        const nodes = baseElement.childNodes;
        const farms = getTableNumber('Granjas:', nodes);
        const villages = getTableNumber('Aldeas:', nodes);
        const reserves = getTableNumber('Reservas:', nodes, 2);
        const lastHarvest = getTableNumber('Ult.Cosecha:', nodes);
        const isRebellious: boolean = this.getIsRebellious(nodes);
        const income = parseIncome(getTableValue('Ingresos:', nodes));
        const qualityOfLife = getTableNumber('Nivel Vida:', nodes);
        return new Economy(farms, villages, reserves, lastHarvest, isRebellious, income, qualityOfLife);
    }

    private static getIsRebellious(nodes: NodeList): boolean {
        for (let node of nodes) {
            const imagePath = (node as HTMLImageElement).src;
            if (imagePath) {
                if (imagePath.includes('icon_enfadado')) return true;
            }
        }
        return false;
    }
}


class Military {
    constructor(
        public army: Army,
        public readonly location: XYPair
    ) {
    }

    public static fromHtmlElement(baseElement: HTMLElement, location: XYPair): Military {
        const army = this.parseArmy(baseElement, location);
        return new Military(army, location);
    }

    private static parseArmy(table: HTMLElement, location: XYPair): Army {
        const data = parseHtmlTable(table);
        let troops = [];
        for (let row of data) {
            let troop = this.parseTroopRow(row, location);
            if (troop) troops.push(troop);
        }
        return new Army(troops, location);
    }

    private static parseTroopRow(row: HTMLElement[], location: XYPair): Troop {
        if ( ! this.isValidTroopRow(row) ) return null;
        const id = parseInteger(row[1].children[0].getAttribute('for').substring(5));
        const type = parseInteger(row[1].children[0].children[0].getAttribute('src').match('[0-9]+').toString());
        const amount = parseInteger(row[2].children[0].children[0].innerHTML);
        const power = parseInteger(row[4].innerText);
        const skill = parseInteger(row[5].innerText);
        const morale = parseInteger(row[6].innerText);
        const destination = parseCoordinates(row[7].innerText);
        return new Troop(id, type, amount, power, skill, morale, location, destination);
    }

    private static isValidTroopRow(row: HTMLElement[]): boolean {
        if (8 != row.length) return false;
        if (1 != row[1].children.length) return false;
        let troopType = row[1];
        return troopType.children[0].getAttribute('for').startsWith('tropa');
    }
}


export async function readFief(location: XYPair): Promise<Fief> {
    let response = await fetchFiefDataAsHtmlResponse(location);
    let doc = parseDom(response);

    const data: HTMLElement = doc.querySelector("#parte_inicial > table.textos > tbody");
    const geography = Geography.fromHtmlElement(data.querySelector("tr:nth-child(1) > td:nth-child(2)"));
    const population = Population.fromHtmlElement(data.querySelector("tr:nth-child(2) > td:nth-child(1)"));
    const economy = Economy.fromHtmlElement(data.querySelector("tr:nth-child(2) > td:nth-child(2)"));
    const military = Military.fromHtmlElement(
        doc.getElementById('checkcambiatodos').parentElement.parentElement.parentElement, location
    );

    return new Fief(
        location,
        geography.terrain,
        population.children, population.men, population.women, population.elders,
        economy.farms, economy.villages, economy.lastHarvest, economy.reserves, economy.isRebellious, economy.income,
        economy.qualityOfLife, military.army
    )
}
