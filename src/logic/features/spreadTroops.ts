import {XYPair} from "../models/XYPair";
import {Troop} from "../models/Troop";


export async function spreadTroops(troop: Troop, destinations: XYPair[], unitsPerGroup: number): Promise<void> {
    const newTroops = await troop.createMultipleGroups(destinations.length, unitsPerGroup);
    for (let i = 0; i < newTroops.length; ++i) await newTroops[i].move(destinations[i]);
}
