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
        port.onMessage.addListener(function(request) {
            console.log('background.js');
        });
    });

})();
