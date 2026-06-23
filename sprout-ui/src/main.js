const { isPermissionGranted, requestPermission, sendNotification } = window.__TAURI__.notification;


const plantSprite = document.getElementById("plantSprite");
const timerText = document.getElementById("timerText");
const notifyBtn = document.getElementById("notifyBtn");

const states = {
  FOCUSING: { text: "Focusing...", frames: ["assets/thriving.png", "assets/thriving2.png", "assets/thriving3.png", "assets/thriving2.png"], color: "#0abde3" },
  WILTING: { text: "Time for a break!", frames: ["assets/wilting.png"], color: "#ff6b81" },
  AWAY: { text: "Taking a break!", frames: ["assets/thriving.png", "assets/thriving2.png", "assets/thriving3.png", "assets/thriving2.png"], color: "#10ac84" } 
};

let isCurrentlyPresent = false;
let sessionStartTime = null;
let hasNotified = false;
const BREAK_THRESHOLD_MS = 15 * 60 * 1000; // DEV NOTE: set to 10000 for testing, ”15 * 60 * 1000“ for normal

let currentActiveState = "AWAY"; 
let currentFrameIndex = 0;          

const bgFrames = ["url('assets/bg1.png')", "url('assets/bg2.png')"];
let currentBgIndex = 0;

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
}

// env animation Loop (500ms)
setInterval(() => {
    currentBgIndex = (currentBgIndex + 1) % bgFrames.length;
    const scene = document.getElementById('scene');
    if (scene) scene.style.backgroundImage = bgFrames[currentBgIndex];
}, 500);

// sprite animation Loop (400ms)
setInterval(() => {
    const state = states[currentActiveState];
    if (!state || state.frames.length <= 1) return; 

    currentFrameIndex = (currentFrameIndex + 1) % state.frames.length;
    plantSprite.setAttribute('src', state.frames[currentFrameIndex]);
}, 400); 

function updatePlantState(stateKey) {
    if (currentActiveState === stateKey) return; 

    const state = states[stateKey];
    if (!state) return;
    
    currentActiveState = stateKey;
    currentFrameIndex = 0; 
    
    
    timerText.style.color = state.color;
    plantSprite.setAttribute('src', state.frames[0]); 
}

notifyBtn.addEventListener("click", async () => {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
    }

    if (permissionGranted) {
        notifyBtn.style.filter = "contrast(80%) opacity(0.6)";
        notifyBtn.style.cursor = "default";
        notifyBtn.style.pointerEvents = "none";
        
        sendNotification({ title: "sprout", body: "I'll alert you when it's time to stand up!" });
    } else {
        notifyBtn.style.filter = "grayscale(100%)";
    }
});

setInterval(async () => {
    try {
        const response = await fetch("http://127.0.0.1:5555/state");
        const data = await response.json();
        
        if (data.status === "PRESENT") {
            if (!isCurrentlyPresent) {
                isCurrentlyPresent = true;
                sessionStartTime = Date.now();
                hasNotified = false; 
            }

            const elapsedMs = Date.now() - sessionStartTime;
            timerText.innerText = formatTime(elapsedMs);

            if (elapsedMs >= BREAK_THRESHOLD_MS) {
                updatePlantState("WILTING"); 
                
                if (!hasNotified) {
                    const permissionGranted = await isPermissionGranted();
                    if (permissionGranted) {
                        sendNotification({ title: "sprout", body: "You've been sitting too long! Time to stand up." });
                    }
                    hasNotified = true; 
                }
            } else {
                updatePlantState("FOCUSING"); 
            }

        } else {
            isCurrentlyPresent = false;
            timerText.innerText = "00:00";
            updatePlantState("AWAY"); 
        }
        
    } catch (error) {
        // API offline
    }
}, 1000);