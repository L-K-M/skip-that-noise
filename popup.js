document.addEventListener('DOMContentLoaded', function () {
    const api = globalThis.browser || globalThis.chrome;

    const artistInput = document.getElementById('artistInput');
    const addButton = document.getElementById('addButton');
    const artistList = document.getElementById('artistList');
    const openImportPageButton = document.getElementById('openImportPageButton');
    const exportButton = document.getElementById('exportButton');
    const importStatus = document.getElementById('importStatus');

    function loadArtists() {
        api.storage.local.get('blockedArtists').then(function (result) {
            const artists = result.blockedArtists || [];
            renderArtists(artists);
        });
    }

    function showStatus(message, isError) {
        importStatus.textContent = message;
        importStatus.className = 'import-status ' + (isError ? 'error' : 'success');
        setTimeout(function () {
            importStatus.textContent = '';
            importStatus.className = '';
        }, 3000);
    }

    function exportArtists() {
        api.storage.local.get('blockedArtists').then(function (result) {
            const artists = result.blockedArtists || [];

            if (artists.length === 0) {
                showStatus('No artists to export', true);
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
                showStatus('Exported ' + artists.length + ' artist(s)', false);

                setTimeout(function () {
                    URL.revokeObjectURL(url);
                }, 1000);
            }).catch(function (err) {
                console.error('Export download failed', err);
                URL.revokeObjectURL(url);
                showStatus('Export failed', true);
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