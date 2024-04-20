function startExercise(totalDuration) {
    const stages = [
        { action: "Inhale", time: 3, minRadius: 40, maxRadius: 70 },
        { action: "Pause", time: 2, minRadius: 70, maxRadius: 70 },
        { action: "Exhale", time: 5, minRadius: 70, maxRadius: 40 },
        { action: "Pause", time: 3, minRadius: 40, maxRadius: 40 }
    ];
    let currentStageIndex = 0;
    let stageEndTime = Date.now() + stages[currentStageIndex].time * 1000;
    let endTime = Date.now() + totalDuration * 1000;

    var breathingCircle = document.getElementById('breathingCircle');
    var breathingStage = document.getElementById('breathingStage');
    var totalTimeDisplay = document.getElementById('totalTime');

    function animate() {
        let now = Date.now();
        let totalTimeLeft = Math.max(0, endTime - now);
        let stageTimeLeft = Math.max(0, stageEndTime - now);

        if (stageTimeLeft <= 0) {
            currentStageIndex = (currentStageIndex + 1) % stages.length;
            stageEndTime = now + stages[currentStageIndex].time * 1000;
        }

        let stage = stages[currentStageIndex];
        let stageProgress = (stage.time * 1000 - stageTimeLeft) / (stage.time * 1000);
        let currentRadius = stage.minRadius + (stage.maxRadius - stage.minRadius) * stageProgress;

        breathingCircle.setAttribute('r', currentRadius);
        breathingStage.textContent = stage.action + ": " + Math.ceil(stageTimeLeft / 1000) + "s";
        totalTimeDisplay.textContent = "Total Time: " + Math.ceil(totalTimeLeft / 1000) + "s";

        if (totalTimeLeft > 0) {
            requestAnimationFrame(animate);
        } else {
            breathingStage.textContent = "Complete";
            breathingCircle.setAttribute('r', 40); // Reset to the initial size
        }
    }

    requestAnimationFrame(animate);
}
