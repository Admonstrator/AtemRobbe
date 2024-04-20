function startSelectedMode() {
    const selectedMode = document.getElementById('modeSelector').value.split('-').map(Number);
    const totalDuration = 10 * 60; // 10 minutes in seconds
    const stages = [
        { action: "Inhale", time: selectedMode[0], minRadius: 40, maxRadius: 70 },
        { action: "Pause", time: selectedMode[1], minRadius: 70, maxRadius: 70 },
        { action: "Exhale", time: selectedMode[2], minRadius: 40, maxRadius: 70 },
        { action: "Pause", time: selectedMode[3], minRadius: 40, maxRadius: 40 }
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

    function animate() {
        const now = Date.now();
        const stageTimeLeft = stageEndTime - now;
        const totalTimeLeft = totalTimeEndTime - now;

        if (stageTimeLeft <= 0) {
            currentStageIndex = (currentStageIndex + 1) % stages.length;
            stageStartTime = now;
            stageEndTime = now + stages[currentStageIndex].time * 1000;
        }

        const stage = stages[currentStageIndex];
        const timeFraction = (now - stageStartTime) / (stages[currentStageIndex].time * 1000);
        const radiusDifference = stage.maxRadius - stage.minRadius;
        let currentRadius = stage.minRadius + radiusDifference * (stage.action === "Inhale" ? timeFraction : 1 - timeFraction);

        breathingCircle.setAttribute('r', currentRadius);
        breathingStage.textContent = `${stage.action}: ${Math.ceil(stageTimeLeft / 1000)}s`;
        totalTimeDisplay.textContent = `Remaining Time: ${Math.ceil(totalTimeLeft / 1000)}s`;

        if (totalTimeLeft > 0) {
            requestAnimationFrame(animate);
        } else {
            breathingStage.textContent = "Complete";
            breathingCircle.setAttribute('r', 40); // Reset to the initial size
        }
    }

    requestAnimationFrame(animate);
}
