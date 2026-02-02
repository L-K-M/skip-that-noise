(function () {
    const api = globalThis.browser || globalThis.chrome;

    const importFile = document.getElementById('importFile');
    const statusEl = document.getElementById('status');

    function showStatus(message, isError) {
        statusEl.textContent = message;
        statusEl.className = 'status ' + (isError ? 'error' : 'success');
        statusEl.style.display = 'block';
    }

    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(String(e.target.result || ''));
            reader.onerror = () => reject(reader.error || new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    function normalizeArtists(text) {
        return text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
    }

    async function importArtists(file) {
        try {
            const text = await readFileAsText(file);
            const incoming = normalizeArtists(text);

            const uniqueIncoming = Array.from(new Set(incoming));
            if (uniqueIncoming.length === 0) {
                showStatus('No valid artists found in file', true);
                return;
            }

            const result = await api.storage.local.get('blockedArtists');
            const existing = Array.isArray(result.blockedArtists) ? result.blockedArtists : [];

            const existingSet = new Set(existing);
            const added = [];
            const duplicates = [];

            for (const a of uniqueIncoming) {
                if (!existingSet.has(a)) {
                    existing.push(a);
                    existingSet.add(a);
                    added.push(a);
                } else {
                    duplicates.push(a);
                }
            }

            await api.storage.local.set({blockedArtists: existing});

            let msg = 'Imported ' + added.length + ' artist(s)';
            if (duplicates.length > 0) {
                msg += ' (' + duplicates.length + ' duplicate(s) skipped)';
            }
            showStatus(msg, false);

            // Notify any open popup to refresh if it's still around.
            try {
                api.runtime.sendMessage({type: 'artistsUpdated'});
            } catch (_) {
                // ignore
            }
        } catch (err) {
            console.error(err);
            showStatus('Error importing file', true);
        }
    }

    importFile.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            importArtists(file);
        }
        importFile.value = '';
    });
})();
