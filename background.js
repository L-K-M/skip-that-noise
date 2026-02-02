const DEFAULT_ARTISTS = [];

browser.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        browser.storage.local.set({blockedArtists: DEFAULT_ARTISTS});
    }
});