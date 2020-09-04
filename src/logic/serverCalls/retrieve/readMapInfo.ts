import {XYPair} from "../../models/XYPair";


export class MapInfo {
    private readonly troopLocations: Set<string>;
    constructor(
        json: JSON
    ) {
        this.troopLocations = new Set<string>(this.extractKeys(json, 'tropas'));
    }

    public isDefended(location: XYPair): boolean {
        return this.troopLocations.has(`${location.x} ${location.y}`);
    }

    private extractKeys(json: JSON, propertyName: string): string[] {
        let result = [];
        let data = json[propertyName];
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                result.push(key);
            }
        }
        return result;
    }
}


export async function readMapInfo(): Promise<MapInfo> {
    const url = `/api/mapa.php`;
    let request = await fetch(url);
    return new MapInfo(await request.json());
}
