import {XYPair} from "../dataContainers";
import {post} from "./utils";


export async function split_troop(troop_id: number, n_remaining_units: number): Promise<void> {
    await post('/api/acciones/tropas/separar', {
        idTropa: troop_id,
        cantidadgrupo: n_remaining_units
    });
}


export async function move_troop(troop_id: number, fief: XYPair, destination: XYPair): Promise<void> {
    await post('/api/acciones/tropas/mover', {
        x: fief.x,
        y: fief.y,
        xdestino: destination.x,
        ydestino: destination.y,
        'tropasel%5B%5D': troop_id,
        personajeseleccionado: 0,
    });
}
