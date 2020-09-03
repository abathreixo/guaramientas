import {CsvDataService} from "./features/csvDataService";
import {XYPair} from "./dataContainers";
import {get_all_owned_fiefs} from "./serverCalls/get_all_owned_fiefs";
import {build_farm} from "./serverCalls/improve_fief";
import {get_money} from "./serverCalls/read_info";
import {SpreadTroops} from "./logic/features/SpreadTroops";
import {readAllOwnedFiefs} from "./logic/serverCalls/retrieve/readAllOwnedFiefs";
import {FiefSet} from "./logic/fiefSet/FiefSet";


let spreadTroopsSettings = {
  fief_x: 0,
  fief_y: 0,
  first_x: 0,
  first_y: 0,
  last_x: 0,
  last_y: 0,
  n_troops: 1,
  type : "Llanura"
};


async function levelup(): Promise<number> {
  let upgraded = 0;
  let allFiefs = await get_all_owned_fiefs();
  let filterfiefs = allFiefs.filter(function (el) {
    return el.terrain == spreadTroopsSettings.type;
  });
  console.log(filterfiefs);
  let money = await get_money();
  for (let i = 0; i < filterfiefs.length; i++) {
    let farmCost = filterfiefs[i].farms * 3000;
    if(money > farmCost) {
      let b_r = await build_farm(filterfiefs[i].location)
      money = money - farmCost;
      ++upgraded;
    } else {
      break;
    }
  }
  return upgraded;
}


async function exportcsv(): Promise<number> {
  let allFiefs = await get_all_owned_fiefs();
  CsvDataService.exportToCsv("feudos.csv", allFiefs);
  return allFiefs.length;
}


class AllOwnedFiefs {
  private static allFiefs: FiefSet=null;
  private constructor() {}

  public static async get(): Promise<FiefSet> {
    if (null === this.allFiefs) {
      this.allFiefs = await readAllOwnedFiefs();
    }
    return this.allFiefs;
  }
}


async function spreadTroops(): Promise<void> {
  const location = new XYPair(spreadTroopsSettings.fief_x, spreadTroopsSettings.fief_y);
  const allFiefs = await AllOwnedFiefs.get();

  const spreadTroops = await SpreadTroops.buildFromFiefLocation(allFiefs, location, spreadTroopsSettings.n_troops);
  await spreadTroops.toRectangle(
      spreadTroopsSettings.first_x, spreadTroopsSettings.last_x,
      spreadTroopsSettings.first_y, spreadTroopsSettings.last_y
  );
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if ('reload' == request) {
    sendResponse(spreadTroopsSettings);
  }
  else if ('spread' == request) {
    spreadTroops().then(value => {sendResponse('done');});
  }
  else if ('levelup' == request) {
    levelup()
    .then(value => {
      sendResponse(value);
    });
  }
  else if ('exportcsv' == request) {
    exportcsv ()
    .then(value => {
      sendResponse(value);
    });
  }
  else {
    spreadTroopsSettings = request;
    sendResponse('ok');
  }
  return true;
});


async function run_me() {
}

run_me().then(value => {console.log("Done");});
