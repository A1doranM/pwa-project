self.addEventListener('install', (event) => {
    console.log('Installing Service Worker: ', event);
    event.waitUntil(caches.open('static-v2')
        .then((cache) => {
            console.log('Precaching App Shell');
            cache.addAll([
                '/',
                '/index.html',
                '/src/js/app.js',
                '/src/js/feed.js',
                '/src/js/material.min.js',
                '/src/css/app.css',
                '/src/css/feed.css',
                '/src/images/main-image.jpg',
                'https://fonts.googleapis.com/css?family=Roboto:400,700',
                'https://fonts.googleapis.com/icon?family=Material+Icons',
                'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
            ]);
        })
        .catch((err) => {
            console.log('Error in sw.js when open caches: ', err);
        }));
});

self.addEventListener('activate', (event) => {
    console.log('Activating Service Worker: ', event);
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((res) => {
                if (res) {
                    return res;
                } else {
                    return fetch(event.request)
                        .then((response) => {
                            caches.open('dynamic')
                                .then((cache) => {
                                    cache.put(event.request.url, response.clone())
                                        .catch((err) => {
                                            console.log('Error in sw.js in fetch while trying to dynamic cache: ', err);
                                        });
                                    return res;
                                });
                        });
                }
            })
    );
});