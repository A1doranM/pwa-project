const dbPromise = idb.open('feed-store', 1, (db) => {
    if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', {keyPath: 'id'});
    }
});

function writeData(st, data) {
    dbPromise
        .then((db) => {
            const tx = db.transaction('posts', 'readwrite');
            const store = tx.objectStore('posts');
            store.put(data);
            return tx.complete;
        });
}

function readAllData(st) {
    return dbPromise
        .then((db) => {
            const tx = db.transaction(st, 'readonly');
            const store = tx.objectStore(st);
            return store.getAll();
        });
}