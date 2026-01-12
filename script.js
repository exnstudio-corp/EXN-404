
let clickCount = 0;
let timerInterval;
let countdownEndTime;
let capturedImageData = null;
let currentSlide = 0;
const totalSlides = 8;

const flashScreen = document.getElementById('flashScreen');
const permissionScreen = document.getElementById('permissionScreen');
const warningScreen = document.getElementById('warningScreen');
const bombScreen = document.getElementById('bombScreen');
const capturedScreen = document.getElementById('capturedScreen');
const nameScreen = document.getElementById('nameScreen');
const slideshowScreen = document.getElementById('slideshowScreen');
const earnedScreen = document.getElementById('earnedScreen');
const giftScreen = document.getElementById('giftScreen');

const timerDisplay = document.getElementById('timerDisplay');
const capturedImage = document.getElementById('capturedImage');
const slideshowImage = document.getElementById('slideshowImage');
const slideCounter = document.getElementById('slideCounter');
const backgroundMusic = document.getElementById('backgroundMusic');

function init() {
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (hasVisited === 'true') {
        showGiftDirectly();
    } else {
        startFlashSequence();
    }
}

function startFlashSequence() {
    flashScreen.style.display = 'flex';
    document.addEventListener('click', handleFlashClick);
}

function handleFlashClick() {
    clickCount++;
    
    if (clickCount >= 5) {
        document.removeEventListener('click', handleFlashClick);
        flashScreen.classList.add('hidden');
        showPermissionScreen();
    }
}

function showPermissionScreen() {
    permissionScreen.classList.remove('hidden');
    
    document.getElementById('grantBtn').addEventListener('click', handleGrant);
    document.getElementById('denyBtn').addEventListener('click', handleDeny);
}

async function handleGrant() {
    permissionScreen.classList.add('hidden');
    warningScreen.classList.remove('hidden');
    
    await capturePhoto();
    
    setTimeout(() => {
        warningScreen.classList.add('hidden');
        startBombCountdown();
    }, 3000);
}

function handleDeny() {
    permissionScreen.classList.add('hidden');
    showNameScreen();
}

async function capturePhoto() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('cameraCanvas');
        
        video.srcObject = stream;
        
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                resolve();
            };
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        capturedImageData = canvas.toDataURL('image/png');
        
        stream.getTracks().forEach(track => track.stop());
    } catch (error) {
        console.error('Camera access denied or failed');
    }
}

function startBombCountdown() {
    bombScreen.classList.remove('hidden');
    
    const savedEndTime = localStorage.getItem('countdownEndTime');
    
    if (savedEndTime) {
        countdownEndTime = parseInt(savedEndTime);
    } else {
        countdownEndTime = Date.now() + 30 * 1000;
        localStorage.setItem('countdownEndTime', countdownEndTime.toString());
    }
    
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const now = Date.now();
    const remaining = Math.max(0, countdownEndTime - now);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (remaining <= 0) {
        clearInterval(timerInterval);
        localStorage.removeItem('countdownEndTime');
        showCapturedImage();
    }
}

function showCapturedImage() {
    bombScreen.classList.add('hidden');
    capturedScreen.classList.remove('hidden');
    
    if (capturedImageData) {
        capturedImage.src = capturedImageData;
    } else {
        capturedImage.style.display = 'none';
    }
    
    document.getElementById('continueBtn').addEventListener('click', () => {
        capturedScreen.classList.add('hidden');
        startSlideshow();
    });
}

function showNameScreen() {
    nameScreen.classList.remove('hidden');
    
    document.getElementById('hintBtn').addEventListener('click', () => {
        alert('ivy');
    });
    
    document.getElementById('submitNameBtn').addEventListener('click', checkName);
    
    document.getElementById('nameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkName();
        }
    });
}

function checkName() {
    const nameInput = document.getElementById('nameInput').value.trim().toLowerCase();
    
    if (nameInput === 'poison ivy') {
        nameScreen.classList.add('hidden');
        startSlideshow();
    } else {
        alert('INCORRECT. TRY AGAIN.');
        document.getElementById('nameInput').value = '';
    }
}

function startSlideshow() {
    slideshowScreen.classList.remove('hidden');
    currentSlide = 0;
    
    backgroundMusic.play();
    
    showSlide();
}

function showSlide() {
    if (currentSlide < totalSlides) {
        slideshowImage.src = `assets/${currentSlide + 1}.jpg`;
        slideCounter.textContent = `${currentSlide + 1}/${totalSlides}`;
        
        currentSlide++;
        
        setTimeout(showSlide, 8000);
    } else {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        slideshowScreen.classList.add('hidden');
        showEarnedScreen();
    }
}

function showEarnedScreen() {
    earnedScreen.classList.remove('hidden');
    
    setTimeout(() => {
        earnedScreen.classList.add('hidden');
        showGift();
    }, 7000);
}

function showGift() {
    giftScreen.classList.remove('hidden');
    localStorage.setItem('hasVisited', 'true');
}

function showGiftDirectly() {
    flashScreen.classList.add('hidden');
    giftScreen.classList.remove('hidden');
}

window.addEventListener('load', init);