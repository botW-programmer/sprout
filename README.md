# sprout

sprout is a cross-process desktop companion application designed to enforce healthy computing habits. It utilizes a headless computer vision backend to monitor user presence and a lightweight, frosted-glass pixel art frontend to provide Pomodoro tracking and posture break notifications.

## Features

* Uses a local Python server utilizing OpenCV and MediaPipe to detect user presence via skeletal and facial tracking (specifically relying on nose/shoulder confidence scores to prevent false positives from empty chairs).
* The frontend UI is driven by independent JS Event Loops, ensuring the 8-bit frame-by-frame Sprite Animations run at a smooth 60fps regardless of the Python backend's polling rate.
* Bypasses browser-level restrictions using a Tauri Rust plugin (`@tauri-apps/plugin-notification`) to push hardware-level alerts directly to the Windows Action Center when a 15-minute sitting threshold is breached.
* Employs `vmin` CSS calculations to perfectly lock all DOM elements, like the Sprout, Tomato timer, and whiteboard—to a responsive 1:1 aspect ratio.

## Prerequisites

To run this project locally, you will need three distinct compilation and runtime environments installed on your machine:
* **Python 3.9+** (vision core)
* **Node.js & npm** (frontend dependencies)
* **Rust & Cargo** (tauri desktop compiler)

## Installation & Setup

Because sprout operates on a bifurcated architecture (two separate brains), you must set up both environments.

### 1. Vision Core (py backend)
Navigate to the root directory and create a virtual environment.

```bash
# Activate your virtual environment
# Windows:
.\sprout_env\Scripts\activate
# Mac/Linux:
source sprout_env/bin/activate

# Install the required deep learning and server packages
pip install opencv-python mediapipe flask flask-cors
```

### 2. UI (tauri frontend)
Open a separate terminal and navigate into the UI directory to install the Node modules.
```bash
cd sprout-ui
npm install
```

### How to Run
You must run both processes simultaneously in two separate terminal windows.

Terminal 1: Start the Vision Server
```bash
# Ensure your virtual environment is active!
python vision_core.py
```

Terminal 2: Compile and Launch the Desktop App
```bash
cd sprout-ui
npm run tauri dev
```


(Note: Initial Rust compilation during the Linking Phase may take several minutes as the linker link.exe stitches object files into the final executable. Subsequent builds are cached and execute rapidly).
