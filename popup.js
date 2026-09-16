document.addEventListener('DOMContentLoaded', function () {
    const api = globalThis.browser || globalThis.chrome;

    const artistInput = document.getElementById('artistInput');
    const addButton = document.getElementById('addButton');
    const addCurrentButton = document.getElementById('addCurrentButton');
    const artistList = document.getElementById('artistList');
    const openImportPageButton = document.getElementById('openImportPageButton');
    const exportButton = document.getElementById('exportButton');
    const importStatus = document.getElementById('importStatus');
    const addStatus = document.getElementById('addStatus');

    function loadArtists() {
        api.storage.local.get('blockedArtists').then(function (result) {
            const artists = result.blockedArtists || [];
            renderArtists(artists);
        });
    }

    const statusTimers = new Map();

    function showStatus(element, message, isError) {
        element.textContent = message;
        element.className = 'status ' + (isError ? 'error' : 'success');
        clearTimeout(statusTimers.get(element));
        statusTimers.set(element, setTimeout(function () {
            element.textContent = '';
            element.className = '';
        }, 3000));
    }

    function exportArtists() {
        api.storage.local.get('blockedArtists').then(function (result) {
            const artists = result.blockedArtists || [];

            if (artists.length === 0) {
                showStatus(importStatus, 'No artists to export', true);
                return;
            }

            const text = artists.join('\n');
            const blob = new Blob([text], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);

            api.downloads.download({
                                       url: url,
                                       filename: 'blocked-artists.txt',
                                       saveAs: true
                                   }).then(function () {
                showStatus(importStatus, 'Exported ' + artists.length + ' artist(s)', false);

                setTimeout(function () {
                    URL.revokeObjectURL(url);
                }, 1000);
            }).catch(function (err) {
                console.error('Export download failed', err);
                URL.revokeObjectURL(url);
                showStatus(importStatus, 'Export failed', true);
            });
        });
    }

    function renderArtists(artists) {
        artistList.innerHTML = '';

        if (artists.length === 0) {
            artistList.innerHTML = '<div class="empty-message">No artists added yet</div>';
            return;
        }

        artists.forEach(function (artist, index) {
            const item = document.createElement('div');
            item.className = 'artist-item';

            const name = document.createElement('span');
            name.className = 'artist-name';
            name.textContent = artist;

            const removeButton = document.createElement('button');
            removeButton.className = 'remove-button';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', function () {
                removeArtist(index);
            });

            item.appendChild(name);
            item.appendChild(removeButton);
            artistList.appendChild(item);
        });
    }

    function addArtist() {
        const name = artistInput.value.trim();
        if (!name) {
            return;
        }

        api.storage.local.get('blockedArtists').then(function (result) {
            const artists = result.blockedArtists || [];
            if (!artists.includes(name)) {
                artists.push(name);
                api.storage.local.set({blockedArtists: artists}).then(function () {
                    artistInput.value = '';
                    renderArtists(artists);
                });
            } else {
                artistInput.value = '';
            }
        });
    }

    function addCurrentArtist() {
        if (addCurrentButton.disabled) {
            return;
        }
        addCurrentButton.disabled = true;

        api.tabs.query({active: true, currentWindow: true}).then(function (tabs) {
            const tab = tabs[0];
            if (!tab || !tab.url || tab.url.indexOf('music.youtube.com') === -1) {
                showStatus(addStatus, 'Open YouTube Music to add the current artist', true);
                return null;
            }
            return api.tabs.sendMessage(tab.id, {type: 'getCurrentArtist'});
        }).then(function (response) {
            if (!response) {
                return null;
            }

            const artist = response.artist;
            if (!artist) {
                showStatus(addStatus, 'No song is currently playing', true);
                return null;
            }

            return api.storage.local.get('blockedArtists').then(function (result) {
                const artists = result.blockedArtists || [];
                if (artists.includes(artist)) {
                    showStatus(addStatus, artist + ' is already in the list', true);
                    return null;
                }
                artists.push(artist);
                return api.storage.local.set({blockedArtists: artists}).then(function () {
                    renderArtists(artists);
                    showStatus(addStatus, 'Added ' + artist, false);
                });
            });
        }).catch(function (err) {
            console.error('addCurrentArtist failed', err);
            showStatus(addStatus, 'Could not add the current artist. Try reloading the YouTube Music tab.', true);
        }).finally(function () {
            addCurrentButton.disabled = false;
        });
    }

    function removeArtist(index) {
        api.storage.local.get('blockedArtists').then(function (result) {
            const artists = result.blockedArtists || [];
            artists.splice(index, 1);
            api.storage.local.set({blockedArtists: artists}).then(function () {
                renderArtists(artists);
            });
        });
    }

    addButton.addEventListener('click', addArtist);

    addCurrentButton.addEventListener('click', addCurrentArtist);

    artistInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addArtist();
        }
    });

    if (openImportPageButton) {
        openImportPageButton.addEventListener('click', function () {
            const url = api.runtime.getURL('import.html');
            api.tabs.create({url: url});
        });
    }

    exportButton.addEventListener('click', exportArtists);

    // Refresh list if the import page updates storage while popup is open.
    try {
        api.runtime.onMessage.addListener(function (message) {
            if (message && message.type === 'artistsUpdated') {
                loadArtists();
            }
        });
    } catch (_) {
    }

    loadArtists();
});