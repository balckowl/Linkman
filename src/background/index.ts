/// タブのページ遷移を監視するイベント
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // ページの読み込みが未完了の場合はスルー
    if (changeInfo.status !== "complete") {
        return;
    }

    // URLがChromeの管理ページの場合はスルー
    if (tab?.url?.startsWith("chrome://")) {
        return;
    }

    console.log(`Change URL: ${tab.url}`);
});

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: '/' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('yes');
    if (request.type === "saveData") {
        // 'myData' として Chrome Storage に保存
        chrome.storage.local.set({ 'myData': request.data }, function () { // 'myData' キーを使用
            console.log('データが保存されました');
        });
    }
});

export { };

