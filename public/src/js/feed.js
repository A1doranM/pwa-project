const shareImageButton = document.getElementById('share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.getElementById('title');
const locationInput = document.getElementById('location');
const confirmationToast = document.getElementById('confirmation-toast');

function openCreatePostModal() {
    console.log('open modal')
    createPostArea.style.display = 'block';
    setTimeout(() => {
        createPostArea.style.transform = 'translateY(0)';
    }, 1);


    if (deferredPrompt) {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then(function (choiceResult) {
            console.log(choiceResult.outcome);

            if (choiceResult.outcome === 'dismissed') {
                console.log('User cancelled installation');
            } else {
                console.log('User added to home screen');
            }
        });

        deferredPrompt = null;
    }

    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.getRegistrations()
    //     .then(function(registrations) {
    //       for (const i = 0; i < registrations.length; i++) {
    //         registrations[i].unregister();
    //       }
    //     })
    // }
}

function closeCreatePostModal() {
    createPostArea.style.transform = 'translateY(100vh)';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
    console.log('clicked');
    if ('caches' in window) {
        caches.open('user-requested')
            .then(function (cache) {
                cache.add('https://httpbin.org/get');
                cache.add('/src/images/sf-boat.jpg');
            });
    }
}

function clearCards() {
    while (sharedMomentsArea.hasChildNodes()) {
        sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    }
}

function createCard(data) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    const cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = `url("${data.image}")`;
    cardTitle.style.backgroundSize = 'cover';
    cardWrapper.appendChild(cardTitle);
    const cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.style.color = 'white';
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = data.title;
    cardTitle.appendChild(cardTitleTextElement);
    const cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = data.location;
    cardSupportingText.style.textAlign = 'center';
    // const cardSaveButton = document.createElement('button');
    // cardSaveButton.textContent = 'Save';
    // cardSaveButton.addEventListener('click', onSaveButtonClicked);
    // cardSupportingText.appendChild(cardSaveButton);
    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
    clearCards();
    for (let i = 0; i < data.length; i++) {
        createCard(data[i]);
    }
}

const url = 'https://progressive-web-app-db-default-rtdb.europe-west1.firebasedatabase.app/posts.json';
let networkDataReceived = false;

fetch(url)
    .then(function (res) {
        return res.json();
    })
    .then(function (data) {
        networkDataReceived = true;
        console.log('From web', data);
        let dataArray = [];
        for (let key in data) {
            dataArray.push(data[key]);
        }
        updateUI(dataArray);
    })
    .catch((err) => {
        console.log('Error in feed.js while fetch data: ', err);
    });

if ('indexedDB' in window) {
    readAllData('posts')
        .then((data) => {
            if (!networkDataReceived) {
                console.log('From cache');
                updateUI(data);
            }
        })
}

function sendData() {
    fetch(
        'https://progressive-web-app-db-default-rtdb.europe-west1.firebasedatabase.app/',
        {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: new Date().toISOString(),
                image: "https://firebasestorage.googleapis.com/v0/b/progressive-web-app-db.appspot.com/o/sf-boat.jpg?alt=media&token=3b874fe9-f69e-47de-9178-20a70d866d49",
                title: titleInput.value,
                location: locationInput.value
            })
        }
    )
        .then((res) => {
            console.log('Data sent: ', res);
            updateUI();
        });
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
        alert('Please enter valid data');
        return;
    }

    closeCreatePostModal();

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then((sw) => {
                const post = {
                    id: new Date().toISOString(),
                    title: titleInput.value,
                    location: locationInput.value
                };
                writeData('sync-posts', post)
                    .then(() => {
                        return sw.sync.register('sync-new-posts');
                    })
                    .then(() => {
                        const data = {message: 'Your post ws saved for sync!'};
                        confirmationToast.MaterialSnackbar.showSnackbar(data);
                    })
                    .catch((err) => {
                        console.log('Error in feed.js in form submit: ', err);
                    });
            });
    } else {
        sendData();
    }
});
