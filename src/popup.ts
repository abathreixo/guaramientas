const element_list = ['fief_x', 'fief_y', 'first_x', 'first_y', 'last_x', 'last_y', 'n_troops'];


function reload_data() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, 'reload', response => {
            for (const key of element_list) {
                let element = document.getElementById(key) as HTMLInputElement;
                element.value = response[key];
            }
        });
    });
}


function update_data() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        let payload = {};
        for (const key of element_list) {
            let element = document.getElementById(key) as HTMLInputElement;
            payload[key] = element.value;
        }
        chrome.tabs.sendMessage(tabs[0].id, payload, response => {
        });
    });
}


function trigger_spread() {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, 'spread', response => {
        });
    });
}


reload_data();


document.getElementById('spread_button').addEventListener('click', trigger_spread);


for (const key of element_list) {
    document.getElementById(key).addEventListener('change', update_data);
}
