import {CompleteFiefData, XYPair} from "../dataContainers";
import {move_troop, split_troop} from "../serverCalls/troops";
import {NoFreeTroopsError} from "../errors";
import {read_fief} from "../serverCalls/read_fief";


export class SpreadTroops {
    static async spread_troops(
        fief: XYPair, target_coordinates: XYPair[], units_per_group: number,
        seed_troop_id: number=null
    ): Promise<void> {
        const troop_ids = await SpreadTroops.split_group(fief, target_coordinates.length, units_per_group, seed_troop_id);

        const n_covered = Math.min(target_coordinates.length, troop_ids.length);
        for (let i = 0; i < n_covered; ++i) {
            await move_troop(troop_ids[i], fief, target_coordinates[i]);
        }
    }

    static async spread_troop_in_a_rectangle(
        fief: XYPair, first_corner: XYPair, second_corner: XYPair, units_per_group: number,
        seed_troop_id: number=null
    ): Promise<void> {
        const target_coordinates = SpreadTroops.get_target_coordinates(first_corner, second_corner);
        return SpreadTroops.spread_troops(fief, target_coordinates, units_per_group, seed_troop_id);
    }

    private static get_target_coordinates(first: XYPair, last: XYPair): XYPair[] {
        let result = [];
        const first_x = Math.min(first.x, last.x);
        const first_y = Math.min(first.y, last.y);
        const last_x = Math.max(first.x, last.x);
        const last_y = Math.max(first.y, last.y);
        for (let x = first_x; x <= last_x; ++x) {
            for (let y = first_y; y <= last_y; ++ y) {
                result.push(new XYPair(x, y));
            }
        }
        return result;
    }

    private static async split_group(location: XYPair, n_groups: number, units_per_group: number, seed_troop_id: number): Promise<number[]> {
        const fief = await read_fief(location);
        if (null === seed_troop_id) seed_troop_id = SpreadTroops.determine_seed_troop_id(fief, units_per_group);
        const troop = fief.own_troops.get(seed_troop_id);
        let remaining_units = troop.amount;

        for (let i = 0; i < n_groups; ++ i) {
            remaining_units -= units_per_group;
            if (remaining_units > 0) await split_troop(seed_troop_id, remaining_units);
            else break;
        }
        let result = await SpreadTroops.get_new_troop_ids(location, fief);
        result.push(seed_troop_id);
        return result;
    }

    private static determine_seed_troop_id(fief: CompleteFiefData, units_per_group: number): number {
        for (let [id, troopData] of fief.own_troops) {
            if (troopData.amount > units_per_group) return id;
        }
        throw new NoFreeTroopsError('Fief has no troops or troops size is too small');
    }

    private static async get_new_troop_ids(location: XYPair, original_fief: CompleteFiefData): Promise<number[]> {
        let result = [];
        const fief = await read_fief(location);
        fief.own_troops.forEach((data, id) => {
            if (! original_fief.own_troops.has(id)) result.push(id);
        });
        return result;
    }
}
