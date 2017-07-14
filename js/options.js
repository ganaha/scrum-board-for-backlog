function save_options() {
    var apiKey = document.getElementById('api_key').value;
    var projKey = document.getElementById('proj_key').value;
    var baseUrl = document.getElementById('base_url').value;
    chrome.storage.sync.set({
        "api_key": apiKey,
        "proj_key": projKey,
        "base_url": baseUrl
    }, function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

function restore_options() {
    chrome.storage.sync.get({
        "api_key": "",
        "proj_key": "",
        "base_url": ""
    }, function(items) {
        document.getElementById('api_key').value = items.api_key;
        document.getElementById('proj_key').value = items.proj_key;
        document.getElementById('base_url').value = items.base_url;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
