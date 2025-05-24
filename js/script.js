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
  
  // Keine speziellen Fixes mehr nötig, da jetzt alle Themes eine definierte Füllfarbe haben
}

// Diese Funktion wird nicht mehr benötigt, da wir das Problem in CSS gelöst haben
// Sie bleibt als Fallback bestehen, falls zukünftig ähnliche Probleme auftreten
function setFeenstaubCircleFill() {
  // Leere Funktion, da nicht mehr benötigt
  // Problem wurde durch korrektes CSS in allen Themes gelöst
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
      case 'css/kitsune.css':
        swatch.style.backgroundColor = '#ff8566';
        swatch.style.border = '1px solid #ffd700';
        break;
    }
    
    // Insert swatch at the beginning of the button
    button.insertBefore(swatch, button.firstChild);
  });
}

// Toggle sound on/off
function disableSound() {
  const soundElements = document.querySelectorAll('audio');
  const currentlyMuted = soundElements[0].muted;
  
  // Toggle muted state (if currently muted, unmute and vice versa)
  const newMutedState = !currentlyMuted;
  
  soundElements.forEach(sound => {
    sound.muted = newMutedState;
  });
  
  const soundButton = document.getElementById('buttonSound');
  soundButton.textContent = newMutedState ? '🔇' : '🔊';
  savePreference('soundEnabled', !newMutedState);
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
  
  // Play end sound when manually stopping
  const endSound = document.getElementById('endSound');
  playSound(endSound);
  
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
    openModal('warningModal');
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

// Prüft, ob der Benutzer einen Nachtmodus bevorzugt
function detectNightMode() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedNightMode = getPreference('nightMode', null);
  
  // Falls eine gespeicherte Einstellung existiert, diese verwenden
  if (savedNightMode !== null) {
    return savedNightMode === 'true';
  }
  
  // Sonst auf Systemeinstellung zurückfallen
  return prefersDark;
}

// Setzt das Theme basierend auf Nachtmodus-Einstellung
function setThemeBasedOnNightMode() {
  const isNightMode = detectNightMode();
  const savedTheme = getPreference('theme', 'css/feenstaub.css');
  
  // Wenn Nachtmodus aktiv ist und nicht bereits Gothic, zu Gothic wechseln
  if (isNightMode && savedTheme !== 'css/gothic.css') {
    switchStylesheet('css/gothic.css');
    return;
  }
  
  // Sonst gespeichertes Theme verwenden
  if (!isNightMode) {
    document.getElementById('theme-stylesheet').href = savedTheme;
    
    // Kein spezieller Fix mehr nötig
  }
}

// Nachverfolgung von Änderungen der Systemeinstellung
function setupNightModeListener() {
  if (window.matchMedia) {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Moderne Browser: addEventListener
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', function(event) {
        // Nur automatisch aktualisieren, wenn keine manuelle Einstellung vorhanden
        if (getPreference('nightMode', null) === null) {
          setThemeBasedOnNightMode();
        }
      });
    } 
    // Ältere Browser: addListener
    else if (darkModeMediaQuery.addListener) {
      darkModeMediaQuery.addListener(function(event) {
        // Nur automatisch aktualisieren, wenn keine manuelle Einstellung vorhanden
        if (getPreference('nightMode', null) === null) {
          setThemeBasedOnNightMode();
        }
      });
    }
  }
}

// Nachtmodus ein- oder ausschalten
function toggleNightMode() {
  const currentNightMode = detectNightMode();
  const newNightMode = !currentNightMode;
  
  // Einstellung speichern
  savePreference('nightMode', newNightMode.toString());
  
  // Theme entsprechend setzen
  if (newNightMode) {
    switchStylesheet('css/gothic.css');
  } else {
    // Zum Standard-Theme zurückwechseln
    const defaultTheme = 'css/feenstaub.css';
    switchStylesheet(defaultTheme);
  }
  
  // Button-Anzeige aktualisieren
  updateNightModeButton(newNightMode);
}

// Aktualisiert die Anzeige des Nachtmodus-Buttons
function updateNightModeButton(isNightMode) {
  const nightModeButton = document.getElementById('buttonNightMode');
  if (nightModeButton) {
    nightModeButton.textContent = isNightMode ? '🌙' : '☀️';
    nightModeButton.setAttribute('title', isNightMode ? 'Nachtmodus ausschalten' : 'Nachtmodus einschalten');
    nightModeButton.setAttribute('aria-label', isNightMode ? 'Nachtmodus ausschalten' : 'Nachtmodus einschalten');
  }
}

// Set up version accordion functionality
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
  
  // Setup version accordion toggles
  document.querySelectorAll('.version-header').forEach(header => {
    header.addEventListener('click', function() {
      // Toggle active class on the content
      const content = this.nextElementSibling;
      content.classList.toggle('active');
      
      // Update the toggle icon
      const icon = this.querySelector('.toggle-icon');
      if (content.classList.contains('active')) {
        icon.textContent = '▼';
      } else {
        icon.textContent = '▶';
      }
    });
  });
}

// Set up the application on load
document.addEventListener('DOMContentLoaded', function() {
  // Nachtmodus-Erkennung und -Einstellung
  const isNightMode = detectNightMode();
  setThemeBasedOnNightMode();
  setupNightModeListener();
  
  // Update night mode button initial state
  updateNightModeButton(isNightMode);
  
  // Add style swatches
  addStyleSwatches();
  setupChangelogLink();
  
  // Set up warning modal close button
  const closeWarningBtn = document.getElementById('closeWarningModal');
  if (closeWarningBtn) {
    closeWarningBtn.onclick = function() { closeModal('warningModal'); };
  }

  // Load saved exercise
  const savedExercise = getPreference('exercise', '');
  if (savedExercise) {
    const modeSelector = document.getElementById('modeSelector');
    modeSelector.value = savedExercise;
  }
  
  // Keine Fixes mehr nötig, da alle Themes jetzt korrekte CSS-Definitionen haben

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
    soundButton.textContent = !soundEnabled ? '🔇' : '🔊';
  }
  
  // Set up modal event listeners
  setupModalListeners();
  
  // Highlight active style button
  const currentTheme = getPreference('theme', 'css/feenstaub.css');
  document.querySelectorAll('.style-button').forEach(button => {
    if (button.dataset.style === currentTheme) {
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
  
  const btnNightMode = document.getElementById('buttonNightMode');
  if (btnNightMode) {
    btnNightMode.onclick = toggleNightMode;
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

// Initialize service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Only try to register service worker if we're in a secure context (https or localhost)
    if (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      navigator.serviceWorker.register('./service-worker.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
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
          console.log('ServiceWorker registration failed: ', error);
          
          // App still works without service worker
          console.log('App running without ServiceWorker. For offline functionality, use a web server.');
        });
    } else {
      console.log('ServiceWorker not registered: Running from file:// URL. For full functionality, use a web server.');
    }
  });
}