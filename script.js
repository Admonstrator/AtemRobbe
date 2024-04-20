function startExercise(totalDuration) {
    const stages = [
        { action: "Inhale", time: 3, minRadius: 40, maxRadius: 70 },
        { action: "Pause", time: 2, minRadius: 70, maxRadius: 70 },
        { action: "Exhale", time: 5, minRadius: 70, maxRadius: 40 },
        { action: "Pause", time: 3, minRadius: 40, maxRadius: 40 }
    ];
    let currentStageIndex = 0;
    let startTime = Date.now();
    let stageEndTime = startTime + stages[currentStageIndex].time * 1000;
    let totalTimeLeft = totalDuration * 1000;

    var breathingCircle = document.getElementById('breathingCircle');
    var breathingStage = document.getElementById('breathingStage');

    function animate() {
        let now = Date.now();
        let stageTimeLeft = stageEndTime - now;
        let totalTimeElapsed = now - startTime;
        if (totalTimeElapsed >= totalTimeLeft) {
            breathingStage.textContent = "Complete";
            breathingCircle.setAttribute('r', 40); // Reset to the initial size
            return; // Stop the animation when the total time is up
        }

        if (stageTimeLeft <= 0) {
            // Move to the next stage
            currentStageIndex = (currentStageIndex + 1) % stages.length;
            stageEndTime = now + stages[currentStageIndex].time * 1000;
            stageTimeLeft = stages[currentStageIndex].time * 1000;
        }

        let stageProgress = 1 - (stageTimeLeft / (stages[currentStageIndex].time * 1000));
        let currentRadius = stages[currentStageIndex].minRadius +
                            (stages[currentStageIndex].maxRadius - stages[currentStageIndex].minRadius) * stageProgress;

        breathingCircle.setAttribute('r', currentRadius);
        breathingStage.textContent = stages[currentStageIndex].action + ": " + Math.ceil(stageTimeLeft / 1000) + "s";

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}
