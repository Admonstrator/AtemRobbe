// Hilfsfunktionen zum Umgang mit Cookies
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

// Stylesheet wechseln und in einem Cookie speichern
function switchStylesheet(path) {
    document.getElementById('theme-stylesheet').href = path;
    setCookie('theme', path, 365); // Theme-Auswahl für ein Jahr speichern
}

// Ausgewähltes Theme und Übung beim Laden der Seite anwenden
document.addEventListener('DOMContentLoaded', (event) => {
    const savedTheme = getCookie('theme');
    if (savedTheme) {
        document.getElementById('theme-stylesheet').href = savedTheme;
        const styleSwitcher = document.getElementById('styleSwitcher');
        styleSwitcher.value = savedTheme;
    }

    const savedExercise = getCookie('exercise');
    if (savedExercise) {
        const modeSelector = document.getElementById('modeSelector');
        modeSelector.value = savedExercise;
    }

    const savedDuration = getCookie('duration');
    if (savedDuration) {
        document.getElementById('durationInput').value = savedDuration;
        document.getElementById('exerciseDurationValue').textContent = savedDuration;
    }
});

function stopExercise() {
    const startButton = document.getElementById('startExercise');
    startButton.textContent = "Übung starten";
    startButton.onclick = startSelectedMode;

    isExerciseRunning = false;
}

function startSelectedMode() {
    const modeSelector = document.getElementById('modeSelector');
    const selectedMode = modeSelector.value.split('-').map(Number);
    if (selectedMode.length !== 4) {
        alert('Bitte wählen Sie einen Modus aus!');
        return;
    }

    // Ausgewählten Modus in einem Cookie speichern
    setCookie('exercise', modeSelector.value, 365);

    const startButton = document.getElementById('startExercise');
    startButton.textContent = "Übung stoppen";
    startButton.onclick = stopExercise;

    const totalDuration = getCookie('duration') ? parseInt(getCookie('duration')) * 60 : 10 * 60; // Dauer aus Cookie oder 10 Minuten
    const stages = [
        { action: "Einatmen", time: selectedMode[0], minRadius: 40, maxRadius: 70 },
        { action: "Bald ausatmen", time: selectedMode[1], minRadius: 70, maxRadius: 70 },
        { action: "Ausatmen", time: selectedMode[2], minRadius: 40, maxRadius: 70 },
        { action: "Bald einatmen", time: selectedMode[3], minRadius: 40, maxRadius: 40 }
    ];

    startExercise(totalDuration, stages);
}

// Beispiel zum Deaktivieren des Sounds
function disableSound() {
    const soundElements = document.querySelectorAll('audio');
    soundElements.forEach(sound => sound.muted = !sound.muted);
    const soundButton = document.getElementById('buttonSound');
    soundButton.textContent = soundButton.textContent === '🔊' ? '🔇' : '🔊';
}

// Diese Funktion setzt die Atemübung fort
function startExercise(totalDuration, stages) {
    let currentStageIndex = 0;
    let stageStartTime = Date.now();
    let stageEndTime = stageStartTime + stages[currentStageIndex].time * 1000;
    let totalTimeEndTime = stageStartTime + totalDuration * 1000;

    const breathingCircle = document.getElementById('breathingCircle');
    const breathingStage = document.getElementById('breathingStage');
    const totalTimeDisplay = document.getElementById('totalTime');
    const inhaleSound = document.getElementById('inhaleSound');
    const exhaleSound = document.getElementById('exhaleSound');
    const pauseSound = document.getElementById('pauseSound');
    const endSound = document.getElementById('endSound');

    isExerciseRunning = true;

    function animate() {
        const now = Date.now();
        const stageTimeLeft = stageEndTime - now;
        const totalTimeLeft = totalTimeEndTime - now;

        if (stageTimeLeft <= 0) {
            if (stages[currentStageIndex].action === "Einatmen") {
                pauseSound.play();
            } else if (stages[currentStageIndex].action === "Bald ausatmen") {
                exhaleSound.play();
            } else if (stages[currentStageIndex].action === "Bald einatmen") {
                inhaleSound.play();
            } else if (stages[currentStageIndex].action === "Ausatmen") {
                pauseSound.play();
            }

            currentStageIndex = (currentStageIndex + 1) % stages.length;
            stageStartTime = now;
            stageEndTime = now + stages[currentStageIndex].time * 1000;
        }

        const stage = stages[currentStageIndex];
        const timeFraction = (now - stageStartTime) / (stages[currentStageIndex].time * 1000);
        const radiusDifference = stage.maxRadius - stage.minRadius;
        let currentRadius = stage.minRadius + radiusDifference * (stage.action === "Einatmen" ? timeFraction : 1 - timeFraction);

        breathingCircle.setAttribute('r', currentRadius);
        breathingStage.textContent = `${stage.action}: ${Math.ceil(stageTimeLeft / 1000)}s`;
        document.title = `${stage.action}: ${Math.ceil(stageTimeLeft / 1000)}s`;
        const minutes = Math.floor(totalTimeLeft / 60000);
        const seconds = Math.floor((totalTimeLeft % 60000) / 1000); // Floor to avoid jumping from 6m 60s to 6m 59s
        totalTimeDisplay.textContent = `Verbleibende Zeit: ${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

        if (totalTimeLeft > 0 && isExerciseRunning) {
            requestAnimationFrame(animate);
        } else {
            // All done
            breathingStage.textContent = "Abgeschlossen!";
            totalTimeDisplay.textContent = "Noch eine Übung?";
            endSound.play();
            breathingCircle.setAttribute('r', 40); // Reset to the initial size
            isExerciseRunning = false;
            // Reset button
            stopExercise();
            // Reset the title
            document.title = "Die AtemRobbe 😮‍💨 🦭";
        }
    }

    requestAnimationFrame(animate);
}

function openDurationModal() {
    document.getElementById('durationModal').style.display = 'block';
}

function closeDurationModal() {
    document.getElementById('durationModal').style.display = 'none';
}

function setDuration() {
    const durationInput = document.getElementById('durationSelect');
    const duration = parseInt(durationInput.value);
    if (duration > 0 && duration <= 120) {
        setCookie('duration', duration, 365);
        document.getElementById('exerciseDurationValue').textContent = duration;
        closeDurationModal();
    } else {
        alert('Bitte geben Sie eine gültige Dauer zwischen 1 und 120 Minuten ein.');
    }
}
