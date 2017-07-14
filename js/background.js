(function() {

    "use strict";

    /**
     * 拡張アイコン押下時の挙動
     */
    chrome.browserAction.onClicked.addListener(function() {
        chrome.tabs.create({
            url: 'main.html'
        });
    });

    chrome.runtime.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(configs) {

            chrome.storage.sync.get({
                "api_key": "",
                "proj_key": "",
                "base_url": ""
            }, function(items) {
                configs.API_KEY = items.api_key;
                configs.PROJECT_KEY = items.proj_key;
                configs.BASE_URL = items.base_url;
                port.postMessage(configs);
            });

        });
    });

})();
