const postbutton = document.getElementById('post')
const randombutton = document.getElementById('random')
const input = document.getElementById('input')
const randomPostContainer = document.getElementById('random-post-container')
const imgPlaceholder = document.getElementById('file-input')
const newPostImageContainer = document.getElementById('new-post-image-container')
const warningText = document.getElementById('warning-text')
const fileInputLabel = document.getElementById('file-input-label')
const imgPrerequisites = document.getElementById('img-prerequisites')

let fileToSend = null;

postbutton.addEventListener("click", () => {
    if(input.value == '') return;

    const formData = new FormData();

    if(fileToSend != null) formData.append('image', fileToSend, fileToSend.name);
    formData.append('message', input.value);

    axios.post(document.URL, formData)
    .then(response => {
        if(fileToSend != null) deleteImage();
        input.value = '';
    })
    .catch(error => {
        console.error(error);
    });
});

randombutton.addEventListener("click", () => {
    axios.get(document.URL + 'random')
    .then(response => {
        if (response.data.image != null) generateRandom(response.data.message, document.URL + 'images/' + response.data.image);
        else generateRandom(response.data.message, null);
    })
    .catch(error => {
        console.error(error);
    })
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
let randomTextContainer;
let randomImgContainer;
let randomImg;

const maxImgContainer = document.getElementById('max-img-container');
const maxImg = document.getElementById('max-img');

maxImgContainer.addEventListener("click", () => {
    maxImgContainer.style.display = 'none';
});

function generateRandom(text, image) {
    if (!loadedOnce) createRandomBase();
    populateRandom(text, image);
}

function populateRandom(text, image) {
    randomTextContainer.textContent = text;
    if(image != null) {
        randomImg.style.display = 'block';
        randomImg.src = image;
        maxImg.src = image;
    } 
    else {
        randomImg.style.display = 'none';
    } 
    
}

function createRandomBase() {
    randomPostContainer.removeChild(document.getElementById('placeholder'));
    randomImgContainer = document.createElement('div');
    randomTextContainer = document.createElement('div');
    randomImg = document.createElement('img');

    randomImgContainer.id = 'random-post-image-container';
    randomTextContainer.id = 'random-post-text-container';
    randomImg.id = 'random-post-image';

    randomImgContainer.classList.add('post-image-container');
    randomTextContainer.classList.add('post-text-container');
    randomImg.classList.add('post-image');
    
    randomImgContainer.appendChild(randomImg);
    randomPostContainer.appendChild(randomImgContainer);
    randomPostContainer.appendChild(randomTextContainer);

    randomImg.addEventListener("click", () => {
        maxImgContainer.style.display = 'flex';
    });

    loadedOnce = true;
}