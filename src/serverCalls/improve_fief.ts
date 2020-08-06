import {XYPair} from "../dataContainers";
import {post} from "./utils";


export async function build_farm(fief: XYPair): Promise<void> {
    const url = `/api/acciones/feudos/subirnivel?x=${fief.x}&y=${fief.y}`;
    await post(url, {tipo: 1});
}
