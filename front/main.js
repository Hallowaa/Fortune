const postbutton = document.getElementById('post');
const randombutton = document.getElementById('random');
const input = document.getElementById('input');
const randomPostContainer = document.getElementById('random-post-container');
const imgPlaceholder = document.getElementById('file-input');
const newPostImageContainer = document.getElementById('new-post-image-container');
const warningText = document.getElementById('warning-text');
const fileInputLabel = document.getElementById('file-input-label');
const imgPrerequisites = document.getElementById('img-prerequisites');
const serverResponseContainer = document.getElementById('server-response-container');
const totalPosts = document.getElementById('total');

let fileToSend = null;

function updateTotalCounter() {
    axios.get(document.URL + 'total')
    .then(response => {
        totalPosts.textContent = response.data.total + ' Posts so far!';
    }).catch(error => {
        flashServerResponse('Something went wrong...', 5000);
        console.error(error);
    });
}

let sending = false;

postbutton.addEventListener("click", () => {
    if(input.value.trim().length == 0) return;
    if(sending == true) {
        flashServerResponse("Uploading, be patient!", 5000);
    }

    const formData = new FormData();

    if(fileToSend != null) formData.append('image', fileToSend, fileToSend.name);
    formData.append('message', input.value);

    sending = true;

    axios.post(document.URL + 'newpost', formData)
    .then(response => {
        if(fileToSend != null) deleteImage();
        if(response.data.valid == true) input.value = '';
        flashServerResponse(response.data.message, 5000);
        setTimeout( () => {
            updateTotalCounter();
        }, 300);
        sending = false;
    })
    .catch(error => {
        flashServerResponse('Something went wrong...', 5000);
        sending = false;
        console.error(error);
    });
});

let lastSeenId;

randombutton.addEventListener("click", () => {
    axios.get(document.URL + 'random', {
        params: {
            id: lastSeenId
        }
    })
    .then(response => {
        if(response.data.success == false) {
            flashServerResponse(response.data.message, 5000);
            return;
        }

        generateRandom(response.data.post);
        lastSeenId = response.data.post._id.toString();
    })
    .catch(error => {
        flashServerResponse('Something went wrong...', 5000);
        console.error(error);
    });
});

imgPlaceholder.onchange = function () {
    const file = this.files[0];

    // 5242880 bytes = 5MiB
    if(file.size > 5242880) {
        warningText.textContent = 'File too big: ' + (file.size / 1048576).toString().substring(0,5) + ' MiB';
        fileToSend = null;
        return;
    }

    fileToSend = file;
    replaceImgPlaceholder(fileToSend);
}

function replaceImgPlaceholder(image) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(image);
    img.classList.add('post-image');

    img.addEventListener("click", () => {
        deleteImage();
    })

    newPostImageContainer.removeChild(fileInputLabel);
    newPostImageContainer.removeChild(imgPrerequisites);
    newPostImageContainer.appendChild(img);
}

function deleteImage() {
    while(newPostImageContainer.children.length > 0) {
        newPostImageContainer.removeChild(newPostImageContainer.firstChild);
    }
    newPostImageContainer.appendChild(fileInputLabel);
    newPostImageContainer.appendChild(imgPrerequisites);
    fileToSend = null;
}

let loadedOnce = false;
let randomContentContainer;
let randomHeaderContainer;
let randomHeader;
let randomTextContainer;
let randomImgContainer;
let randomImg;

const maxImgContainer = document.getElementById('max-img-container');
const maxImg = document.getElementById('max-img');

maxImgContainer.addEventListener("click", () => {
    maxImgContainer.style.display = 'none';
});

function generateRandom(post) {
    if (!loadedOnce) createRandomBase();
    populateRandom(post);
}

function populateRandom(post) {
    randomTextContainer.textContent = post.message;
    if(post.postNumber != null) randomHeader.textContent = generatePostNumber(post.postNumber);
    else randomHeader.textContent = '#???????????????';

    if(post.image != null) {
        randomImg.style.display = 'block';
        randomImg.src = document.URL + 'images/' + post.image;
        maxImg.src = document.URL + 'images/' + post.image;
        
    } 
    else {
        randomImg.style.display = 'none';
    }
}

function generatePostNumber(number) {
    const length = 16;
    const zeroesToAdd = length - number.toString().length - 1;
    let result = "#";

    for (let i = 0; i < zeroesToAdd; i++) {
        result += "0";
    }

    result += number.toString();
    return result;
}

function createRandomBase() {
    randomPostContainer.removeChild(document.getElementById('placeholder'));
    randomImgContainer = newE('div', 'random-post-image-container', 'post-image-container');
    randomContentContainer = newE('div', 'random-post-content-container', 'post-content-container');
    randomHeaderContainer = newE('div', 'random-post-header-container', 'post-header-container');
    randomHeader = newE('div', 'random-post-header', 'post-header');
    randomTextContainer = newE('div', 'random-post-text-container', 'post-text-container');
    randomImg = newE('img', 'random-post-image', 'post-image');
    
    randomImgContainer.appendChild(randomImg);
    randomPostContainer.appendChild(randomImgContainer);
    randomHeaderContainer.appendChild(randomHeader);
    randomContentContainer.appendChild(randomHeaderContainer);
    randomContentContainer.appendChild(randomTextContainer);
    randomPostContainer.appendChild(randomContentContainer);

    randomImg.addEventListener("click", () => {
        maxImgContainer.style.display = 'flex';
    });

    loadedOnce = true;
}

function flashServerResponse(message, time) {
    const serverResponse = document.createElement('div');
    serverResponse.classList.add('server-response');
    serverResponse.textContent = message;

    serverResponseContainer.prepend(serverResponse);

    setTimeout( () => {
        serverResponseContainer.removeChild(serverResponse);
    }, time);
}

function newE(type, id, ...classes) {
    const element = document.createElement(type);
    element.id = id;
    
    classes.forEach(clazz => {
        element.classList.add(clazz);
    });

    return element;
}


document.addEventListener("DOMContentLoaded", (event) => {
    updateTotalCounter();
});