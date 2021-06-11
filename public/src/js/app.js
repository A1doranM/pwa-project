let deferredPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then((_) => {
            console.log('Service worker registered');
        })
        .catch(e => console.log('Error in app.js when registering serviceWorker: ', e));
}

window.addEventListener('beforeinstallprompt', (event) => {
    console.log('Before install prompt: ');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});
