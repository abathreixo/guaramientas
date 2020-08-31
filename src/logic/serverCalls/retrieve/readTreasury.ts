export async function readTreasury(): Promise<number> {
    const url = `/api/notificaciones.php`;
    let request = await fetch(url);
    let infoJSON = await request.json();
    return parseInt(infoJSON.oro.replace(".", ""));
}
