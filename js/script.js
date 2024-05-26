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

    const totalDuration = 10 * 60; // 10 minutes
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
