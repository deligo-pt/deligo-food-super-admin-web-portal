export function cleanupFirebaseDatabases(): Promise<void> {
    const dbNames = [
        "firebase-messaging-database",
        "firebase-messaging",
        "firebase-installations-database",
        "firebase-installations",
        "firebase-heartbeat-database",
        "firebaseLocalStorageDb",
    ];

    const deletePromises = dbNames.map((name) => {
        return new Promise<void>((resolve) => {
            try {
                const req = indexedDB.deleteDatabase(name);
                req.onsuccess = () => {
                    console.log(`[FCM Cleanup] Deleted: ${name}`);
                    resolve();
                };
                req.onerror = (e) => {
                    console.warn(`[FCM Cleanup] Failed to delete ${name}`, e);
                    resolve(); // don't fail the whole cleanup
                };
                req.onblocked = () => {
                    console.warn(`[FCM Cleanup] Blocked: ${name} (other tabs open?)`);
                    resolve();
                };
            } catch (e) {
                console.warn(`[FCM Cleanup] Error on ${name}`, e);
                resolve();
            }
        });
    });

    return Promise.all(deletePromises).then(() => undefined);
}