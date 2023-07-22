chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
    console.log(message)
    console.log(sender)
    sendResponse("Received message in background!!")
})

// might use this in the manifest.json later:
// "oauth2": {
//     "client_id": "something here later",
//     "scopes": [
//         "https://www.googleapis.com/auth/spreadsheets",
//         "https://www.googleapis.com/auth/drive.readonly"
// ]},

async function executeContextScript(tabID,f,args=[],pause=0){
    chrome.scripting.executeScript({
      target : { tabId : tabID},
      //world : "MAIN",     // see https://groups.google.com/a/chromium.org/g/chromium-extensions/c/tCWVZRq77cg/m/KB6-tvCdAgAJ
                            // we don't use this now because chrome.runtime is not unconditionally defined in the website context anymore
                            // this was necessary to get the script running in the same context as the site rather than on a virtual isolated context
      func : f,
      args : args,
    }); 
    if (pause>0) {
      console.log(`${f.name} execution sent, pausing ${pause}ms in service worker...`);
      await new Promise(r => setTimeout(r, pause));
    }
}

function ephemeralContext_addKeyStroker(){
    console.log("ephemeralContext_addKeyStroker() called");
    window.addEventListener('keypress',function(key){
        console.log(key.key)
        let keyvalue = key.key
        chrome.runtime.sendMessage(
            keyvalue,
            (response)=>{
                console.log("Sent key value"+response)
            }
        )
    })
}

chrome.action.onClicked.addListener(async (tab) => {
    console.log("Clicked on extension icon...");
    executeContextScript(tab.id, ephemeralContext_addKeyStroker, [], 0);
});