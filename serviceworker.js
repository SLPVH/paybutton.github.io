// Cache contents on install
self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('offline').then(function(cache) {
			return cache.addAll(
				[
				'/css/styles.css',
				'/css/buttons.css',
				'/css/modal.css',
				'/js/main.js',
				'/js/qrjs2.js',
				'/js/spicebutton.js',
				'/js/urls.js',
				'/index.html'
				]
			);
		})
	);
});

// Intercepts network calls to serve from cache if available
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

/* // Remove outdated caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(offline) {
          return true;
        }).map(function(offline) {
          return caches.delete(offline);
        })
      );
    })
  );
}); */