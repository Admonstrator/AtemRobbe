/**
 * AtemRobbe - A breathing exercise application
 * Modern JavaScript implementation with localStorage
 */

// Global variables
let isExerciseRunning = false;
let currentAnimation = null;

// Helper for localStorage - get preference
function getPreference(key, defaultValue) {
  return localStorage.getItem(`atemrobbe_${key}`) || defaultValue;
}

// Helper for localStorage - save preference
function savePreference(key, value) {
  localStorage.setItem(`atemrobbe_${key}`, value);
}

// Switch the CSS theme
function switchStylesheet(path) {
  document.getElementById('theme-stylesheet').href = path;
  savePreference('theme', path);
  
  // Update active class on style buttons
  document.querySelectorAll('.style-button').forEach(button => {
    if (button.dataset.style === path) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

// Add preview swatches to style buttons
function addStyleSwatches() {
  document.querySelectorAll('.style-button').forEach(button => {
    // Skip if already has a swatch
    if (button.querySelector('.style-swatch')) return;
    
    // Create a preview swatch
    const swatch = document.createElement('span');
    swatch.className = 'style-swatch';
    
    // Set specific colors based on theme
    switch (button.dataset.style) {
      case 'css/styles.css':
        swatch.style.backgroundColor = '#007aff';
        break;
      case 'css/c64.css':
        swatch.style.backgroundColor = '#000080';
        break;
      case 'css/ukraine.css':
        swatch.style.backgroundColor = '#0057B7';
        swatch.style.border = '2px solid #FFD700';
        break;
      case 'css/vaporwave.css':
        swatch.style.background = 'linear-gradient(to right, #ff77e9, #7a77ff)';
        break;
      case 'css/90s.css':
        swatch.style.backgroundColor = '#008080';
        break;
      case 'css/feenstaub.css':
        swatch.style.backgroundColor = '#d9a679';
        break;
      case 'css/gothic.css':
        swatch.style.backgroundColor = '#2c3e50';
        swatch.style.border = '1px solid #6e8cb2';
        break;
    }
    
    // Insert swatch at the beginning of the button
    button.insertBefore(swatch, button.firstChild);
  });
}

// Toggle sound on/off
function disableSound() {
  const soundElements = document.querySelectorAll('audio');
  const soundEnabled = soundElements[0].muted;
  
  soundElements.forEach(sound => {
    sound.muted = !soundEnabled;
  });
  
  const soundButton = document.getElementById('buttonSound');
  soundButton.textContent = soundEnabled ? '🔊' : '🔇';
  savePreference('soundEnabled', soundEnabled);
}

// Play a sound with error handling
function playSound(sound) {
  if (sound && !sound.muted) {
    sound.play().catch(e => console.warn(`Sound couldn't play: ${e.message}`));
  }
}

// Stop the current exercise
function stopExercise() {
  const startButton = document.getElementById('startExercise');
  startButton.textContent = "Übung starten";
  startButton.onclick = startSelectedMode;

  isExerciseRunning = false;
  
  if (currentAnimation) {
    cancelAnimationFrame(currentAnimation);
    currentAnimation = null;
  }
  
  // Reset UI
  document.getElementById('breathingCircle').setAttribute('r', 40);
  document.getElementById('breathingStage').textContent = "Start";
  document.getElementById('totalTime').textContent = "Verbleibende Zeit: 0s";
  document.title = "Die AtemRobbe 😮‍💨 🦭";
}

// Start the selected breathing exercise
function startSelectedMode() {
  const modeSelector = document.getElementById('modeSelector');
  const selectedMode = modeSelector.value.split('-').map(Number);
  
  if (selectedMode.length !== 4) {
    alert('Bitte wähle einen Modus aus!');
    return;
  }

  // Save the selected exercise
  savePreference('exercise', modeSelector.value);

  // Update button
  const startButton = document.getElementById('startExercise');
  startButton.textContent = "Übung stoppen";
  startButton.onclick = stopExercise;

  // Get duration from localStorage or use default of 10 minutes
  const totalDuration = parseInt(getPreference('duration', '10')) * 60;
  
  const stages = [
    { action: "Einatmen", time: selectedMode[0], minRadius: 40, maxRadius: 70 },
    { action: "Bald ausatmen", time: selectedMode[1], minRadius: 70, maxRadius: 70 },
    { action: "Ausatmen", time: selectedMode[2], minRadius: 40, maxRadius: 70 },
    { action: "Bald einatmen", time: selectedMode[3], minRadius: 40, maxRadius: 40 }
  ];

  startExercise(totalDuration, stages);
}

// Run the breathing exercise
function startExercise(totalDuration, stages) {
  const breathingCircle = document.getElementById('breathingCircle');
  const breathingStage = document.getElementById('breathingStage');
  const totalTimeDisplay = document.getElementById('totalTime');
  const inhaleSound = document.getElementById('inhaleSound');
  const exhaleSound = document.getElementById('exhaleSound');
  const pauseSound = document.getElementById('pauseSound');
  const endSound = document.getElementById('endSound');

  let currentStageIndex = 0;
  let stageStartTime = Date.now();
  let stageEndTime = stageStartTime + stages[currentStageIndex].time * 1000;
  let totalTimeEndTime = stageStartTime + totalDuration * 1000;

  isExerciseRunning = true;

  function animate() {
    const now = Date.now();
    const stageTimeLeft = stageEndTime - now;
    const totalTimeLeft = totalTimeEndTime - now;

    if (stageTimeLeft <= 0) {
      // Play appropriate sound when transitioning stages
      if (stages[currentStageIndex].action === "Einatmen") {
        playSound(pauseSound);
      } else if (stages[currentStageIndex].action === "Bald ausatmen") {
        playSound(exhaleSound);
      } else if (stages[currentStageIndex].action === "Bald einatmen") {
        playSound(inhaleSound);
      } else if (stages[currentStageIndex].action === "Ausatmen") {
        playSound(pauseSound);
      }

      // Move to next stage
      currentStageIndex = (currentStageIndex + 1) % stages.length;
      stageStartTime = now;
      stageEndTime = now + stages[currentStageIndex].time * 1000;
    }

    const stage = stages[currentStageIndex];
    const timeFraction = (now - stageStartTime) / (stages[currentStageIndex].time * 1000);
    const radiusDifference = stage.maxRadius - stage.minRadius;
    let currentRadius = stage.minRadius + radiusDifference * (stage.action === "Einatmen" ? timeFraction : 1 - timeFraction);

    // Update UI
    breathingCircle.setAttribute('r', currentRadius);
    breathingStage.textContent = `${stage.action}: ${Math.ceil(stageTimeLeft / 1000)}s`;
    document.title = `${stage.action}: ${Math.ceil(stageTimeLeft / 1000)}s`;
    
    const minutes = Math.floor(totalTimeLeft / 60000);
    const seconds = Math.floor((totalTimeLeft % 60000) / 1000);
    totalTimeDisplay.textContent = `Verbleibende Zeit: ${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

    if (totalTimeLeft > 0 && isExerciseRunning) {
      currentAnimation = requestAnimationFrame(animate);
    } else {
      // Exercise complete
      breathingStage.textContent = "Abgeschlossen!";
      totalTimeDisplay.textContent = "Noch eine Übung?";
      playSound(endSound);
      breathingCircle.setAttribute('r', 40); // Reset to initial size
      isExerciseRunning = false;
      // Reset button
      stopExercise();
    }
  }

  currentAnimation = requestAnimationFrame(animate);
}

// Handle opening modals
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
  
  // Focus trap
  const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
    
    modal.addEventListener('keydown', function trapTabKey(e) {
      if (e.key === 'Tab') {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    });
  }
}

// Handle closing modals
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

// Set up event listeners for modals
function setupModalListeners() {
  // Handle ESC key to close modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(modal => {
        if (modal.style.display === 'block') {
          modal.style.display = 'none';
        }
      });
    }
  });
  
  // Close buttons for modals
  document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });
}

// Set duration from modal
function setDuration() {
  const durationInput = document.getElementById('durationSelect');
  const duration = parseInt(durationInput.value);
  
  if (duration > 0 && duration <= 120) {
    savePreference('duration', duration);
    document.getElementById('exerciseDurationValue').textContent = duration;
    closeModal('durationModal');
  } else {
    alert('Bitte geben Sie eine gültige Dauer zwischen 1 und 120 Minuten ein.');
  }
}

function setupChangelogLink() {
    const versionLink = document.querySelector('.version-link');
    if (versionLink) {
      versionLink.addEventListener('click', function(e) {
        e.preventDefault();
        openModal('changelogModal');
      });
    }
    
    const closeBtn = document.getElementById('closeChangelogModal');
    if (closeBtn) {
      closeBtn.onclick = function() { closeModal('changelogModal'); };
    }
  }

// Set up the application on load
document.addEventListener('DOMContentLoaded', function() {
  // Load saved theme
  const savedTheme = getPreference('theme', 'css/feenstaub.css');
  document.getElementById('theme-stylesheet').href = savedTheme;
  
  // Add style swatches
  addStyleSwatches();
  setupChangelogLink();

  
  // Load saved exercise
  const savedExercise = getPreference('exercise', '');
  if (savedExercise) {
    const modeSelector = document.getElementById('modeSelector');
    modeSelector.value = savedExercise;
  }

  // Load saved duration
  const savedDuration = getPreference('duration', '10');
  document.getElementById('exerciseDurationValue').textContent = savedDuration;
  const durationSelect = document.getElementById('durationSelect');
  if (durationSelect) {
    durationSelect.value = savedDuration;
  }
  
  // Set up sound state
  const soundEnabled = getPreference('soundEnabled', 'false') === 'true';
  const soundElements = document.querySelectorAll('audio');
  soundElements.forEach(sound => {
    sound.muted = !soundEnabled;
  });
  
  const soundButton = document.getElementById('buttonSound');
  if (soundButton) {
    soundButton.textContent = soundEnabled ? '🔊' : '🔇';
  }
  
  // Set up modal event listeners
  setupModalListeners();
  
  // Highlight active style button
  document.querySelectorAll('.style-button').forEach(button => {
    if (button.dataset.style === savedTheme) {
      button.classList.add('active');
    }
    
    // Add click event
    button.addEventListener('click', function() {
      switchStylesheet(this.dataset.style);
      closeModal('styleModal');
    });
  });
  
  // Attach event listeners to buttons
  const btnSound = document.getElementById('buttonSound');
  if (btnSound) {
    btnSound.onclick = disableSound;
  }
  
  const btnSetDuration = document.getElementById('buttonSetDuration');
  if (btnSetDuration) {
    btnSetDuration.onclick = function() { openModal('durationModal'); };
  }
  
  const btnInfo = document.getElementById('buttonInfo');
  if (btnInfo) {
    btnInfo.onclick = function() { openModal('infoModal'); };
  }
  
  const btnStyle = document.getElementById('buttonStyle');
  if (btnStyle) {
    btnStyle.onclick = function() { openModal('styleModal'); };
  }
  
  const btnSaveDuration = document.getElementById('saveDuration');
  if (btnSaveDuration) {
    btnSaveDuration.onclick = setDuration;
  }
  
  const btnCloseInfo = document.getElementById('closeInfoModal');
  if (btnCloseInfo) {
    btnCloseInfo.onclick = function() { closeModal('infoModal'); };
  }
  
  // Set up exercise button
  const startButton = document.getElementById('startExercise');
  if (startButton) {
    startButton.onclick = startSelectedMode;
  }
});

function setupChangelogLink() {
  const versionLink = document.querySelector('.version-link');
  if (versionLink) {
    versionLink.addEventListener('click', function(e) {
      e.preventDefault();
      openModal('changelogModal');
    });
  }
  
  const closeBtn = document.getElementById('closeChangelogModal');
  if (closeBtn) {
    closeBtn.onclick = function() { closeModal('changelogModal'); };
  }
}

// Füge dies zum DOM-Ready-Event hinzu
document.addEventListener('DOMContentLoaded', function() {
  // Bestehender Code...
  setupChangelogLink();
});

// Initialize service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./service-worker.js')
      .then(function(registration) {
        registration.onupdatefound = function() {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = function() {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New version available notification
                const updateNotification = document.createElement('div');
                updateNotification.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#4CAF50;color:white;padding:10px 20px;border-radius:5px;box-shadow:0 2px 5px rgba(0,0,0,0.2);z-index:9999;';
                updateNotification.innerHTML = 'Neue Version verfügbar! Wird geladen... <span id="update-countdown">3</span>';
                document.body.appendChild(updateNotification);
                
                let countdown = 3;
                const timer = setInterval(function() {
                  countdown--;
                  document.getElementById('update-countdown').textContent = countdown;
                  if (countdown <= 0) {
                    clearInterval(timer);
                    // Clear cache and reload page
                    caches.keys().then(function(names) {
                      return Promise.all(names.map(function(name) {
                        return caches.delete(name);
                      }));
                    }).then(function() {
                      location.reload(true);
                    });
                  }
                }, 1000);
              }
            }
          };
        };
      }).catch(function(error) {
        console.error('Service Worker registration failed:', error);
      });
  });
}