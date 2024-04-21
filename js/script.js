const translations = {
    "en": {
        "appTitle": "Breathing Exercise",
        "introText": "Choose an exercise mode. Inhale when the circle expands and exhale when it contracts.",
        "exerciseDuration": "Exercise Duration: 10 minutes",
        "remainingTime": "Remaining Time:",
        "startExerciseButton": "Start Exercise",
        "mute": "Mute Sound",
        "credits": "Helping the 🦭 to breath since 2024 - Version 2024-04-20-01",
        "inspiredBy": "Inspired by the AtemApp at Dr. Thomas Weiss Praxisklinik, Mannheim",
        "language": "Change Language"
    },
    "de": {
        "appTitle": "Atemübung",
        "introText": "Wählen Sie eine Übung aus. Atmen Sie ein, wenn der Kreis größer wird. Atmen Sie aus, wenn er kleiner wird.",
        "exerciseDuration": "Übungsdauer: 10 Minuten",
        "remainingTime": "Verbleibende Zeit:",
        "startExerciseButton": "Übung starten",
        "mute": "Sound ausschalten",
        "credits": "Hilft der 🦭 richtig zu Atmen seit 2024 - Version 2024-04-20-01",
        "inspiredBy": "Inspiriert durch die Atem-App der Dr. Thomas Weiss Praxisklinik, Mannheim",
        "language": "Sprache ändern"    }
};

function stopExercise() {
    // stop the exercise and reset the button
    const startButton = document.getElementById('startExercise');
    startButton.textContent = "Übung starten";
    startButton.onclick = startSelectedMode;

    // Stop the exercise
    isExerciseRunning = false;
}

function startSelectedMode() {
    const selectedMode = document.getElementById('modeSelector').value.split('-').map(Number);
    if (selectedMode.length !== 4) {
       alert('Bitte wählen Sie einen Modus aus!');
       return;
    }
    // Change name of id startExerciseButton
    const startButton = document.getElementById('startExercise');
    startButton.textContent = "Übung stoppen";
    startButton.onclick = stopExercise;

    const totalDuration = 10 * 60; // 10 minutes in seconds
    const stages = [
        { action: "Einatmen", time: selectedMode[0], minRadius: 40, maxRadius: 70 },
        { action: "Bald ausatmen", time: selectedMode[1], minRadius: 70, maxRadius: 70 },
        { action: "Ausatmen", time: selectedMode[2], minRadius: 40, maxRadius: 70 },
        { action: "Bald einatmen", time: selectedMode[3], minRadius: 40, maxRadius: 40 }
    ];
    startExercise(totalDuration, stages);
}

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
        const seconds = Math.ceil((totalTimeLeft % 60000) / 1000);
        totalTimeDisplay.textContent = `Verbleibende Zeit: ${minutes}m ${seconds}s`;

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
            document.title = "AtemRobbe 😮‍💨 🦭";
        }
    }

    requestAnimationFrame(animate);
}

function switchStylesheet(path) {
    document.getElementById('theme-stylesheet').href = path;
}

function disableSound() {
    const inhaleSound = document.getElementById('inhaleSound');
    const exhaleSound = document.getElementById('exhaleSound');
    const pauseSound = document.getElementById('pauseSound');
    const endSound = document.getElementById('endSound');

    inhaleSound.muted = !inhaleSound.muted;
    exhaleSound.muted = !exhaleSound.muted;
    pauseSound.muted = !pauseSound.muted;
    endSound.muted = !endSound.muted;

    // Update the button text on id sound
    const soundButton = document.getElementById('buttonSound');
    soundButton.textContent = inhaleSound.muted ? '🔇' : '🔊';
    // change title of button
    soundButton.title = inhaleSound.muted ? 'Sound einschalten' : 'Sound ausschalten';    
}