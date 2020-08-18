import {SpreadTroops} from "./features/spreadTroops";
import {CsvDataService} from "./features/csvDataService";
import {XYPair} from "./dataContainers";
import {get_all_owned_fiefs} from "./serverCalls/get_all_owned_fiefs";
import {build_farm} from "./serverCalls/improve_fief";
import {get_money} from "./serverCalls/read_info";

let spread_troops_settings = {
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
    return el.terrain == spread_troops_settings.type;
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if ('reload' == request) {
    sendResponse(spread_troops_settings);
  }
  else if ('spread' == request) {
    const location = new XYPair(spread_troops_settings.fief_x, spread_troops_settings.fief_y);
    const first = new XYPair(spread_troops_settings.first_x, spread_troops_settings.first_y);
    const last = new XYPair(spread_troops_settings.last_x, spread_troops_settings.last_y);
    SpreadTroops.spread_troop_in_a_rectangle(location, first, last, spread_troops_settings.n_troops).then(value => {
      sendResponse('done');
    });
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
    spread_troops_settings = request;
    sendResponse('ok');
  }
  return true;
});


async function run_me() {
}

run_me().then(value => {console.log("Done");});
