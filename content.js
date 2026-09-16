(function () {
    let blockedArtists = [];
    let lastSongInfo = null;

    function loadBlockedArtists() {
        browser.storage.local.get('blockedArtists').then(function (result) {
            blockedArtists = result.blockedArtists || [];
        });
    }

    function normalizeText(text) {
        return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
    }

    function shouldSkipSong(artistText, songTitle) {
        if (!blockedArtists.length) {
            return false;
        }

        const normalizedArtistText = normalizeText(artistText);
        const normalizedSongTitle = normalizeText(songTitle);

        for (const blockedArtist of blockedArtists) {
            const normalizedBlocked = normalizeText(blockedArtist);

            if (normalizedArtistText.includes(normalizedBlocked)) {
                return true;
            }

            if (normalizedSongTitle.includes(normalizedBlocked)) {
                return true;
            }
        }

        return false;
    }

    function getCurrentSongInfo() {
        const titleElement = document.querySelector('ytmusic-player-bar .title');
        const artistElement = document.querySelector('ytmusic-player-bar .byline');

        if (titleElement && artistElement) {
            return {
                title: titleElement.textContent.trim(),
                artist: artistElement.textContent.trim()
            };
        }

        const titleElementAlt = document.querySelector('.ytmusic-player-bar.title');
        const artistElementAlt = document.querySelector('.ytmusic-player-bar.byline');

        if (titleElementAlt && artistElementAlt) {
            return {
                title: titleElementAlt.textContent.trim(),
                artist: artistElementAlt.textContent.trim()
            };
        }

        return null;
    }

    function getCurrentArtist() {
        const byline = document.querySelector('ytmusic-player-bar .byline')
            || document.querySelector('.ytmusic-player-bar.byline');

        if (!byline) {
            return null;
        }

        const artistLink = byline.querySelector('a');
        if (artistLink && artistLink.textContent.trim()) {
            return artistLink.textContent.trim();
        }

        const text = byline.textContent.trim();
        const separator = text.indexOf('•');
        const artist = separator === -1 ? text : text.slice(0, separator).trim();
        return artist || null;
    }

    function clickSkipButton() {
        const skipButton = document.querySelector('.next-button');
        if (skipButton) {
            skipButton.click();
            console.log('YouTube Music Skip Artists: Skipped song by blocked artist with selector .next-button');
            return true;
        }

        const skipButtonAlt = document.querySelector('ytmusic-player-bar .next-button');
        if (skipButtonAlt) {
            skipButtonAlt.click();
            console.log('YouTube Music Skip Artists: Skipped song by blocked artist with selector ytmusic-player-bar .next-button');
            return true;
        }

        const nextButton = document.querySelector('button[aria-label="Next"]');
        if (nextButton) {
            nextButton.click();
            console.log('YouTube Music Skip Artists: Skipped song by blocked artist with selector button[aria-label="Next"]');
            return true;
        }

        return false;
    }

    function checkAndSkip() {
        const songInfo = getCurrentSongInfo();

        if (!songInfo) {
            return;
        }

        const songKey = songInfo.title + '|' + songInfo.artist;
        if (lastSongInfo === songKey) {
            return;
        }

        if (shouldSkipSong(songInfo.artist, songInfo.title)) {
            console.log('YouTube Music Skip Artists: Blocking song -', songInfo.title, 'by', songInfo.artist);
            setTimeout(function () {
                clickSkipButton();
            }, 500);
        }

        lastSongInfo = songKey;
    }

    function init() {
        loadBlockedArtists();

        browser.storage.onChanged.addListener(function (changes, area) {
            if (area === 'local' && changes.blockedArtists) {
                blockedArtists = changes.blockedArtists.newValue || [];
            }
        });

        const observer = new MutationObserver(function (mutations) {
            checkAndSkip();
        });

        const playerBar = document.querySelector('ytmusic-player-bar');
        if (playerBar) {
            observer.observe(playerBar, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        setInterval(checkAndSkip, 2000);

        checkAndSkip();
    }

    browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message && message.type === 'getCurrentArtist') {
            sendResponse({artist: getCurrentArtist()});
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
