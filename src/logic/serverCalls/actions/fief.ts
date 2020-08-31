import {XYPair} from "../../models/XYPair";
import {post} from "../utils/calls";


export async function buildFarm(fief: XYPair): Promise<boolean> {
    const url = `/api/acciones/feudos/subirnivel?x=${fief.x}&y=${fief.y}`;
    await post(url, {tipo: 1});
    return true;
}
