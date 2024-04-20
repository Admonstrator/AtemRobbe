function startExercise(totalDuration) {
    const stages = [
        { action: "Inhale", time: 3 },
        { action: "Pause", time: 2 },
        { action: "Exhale", time: 5 },
        { action: "Pause", time: 3 }
    ];
    let currentStage = 0;
    let stageTimeLeft = stages[0].time;
    let totalTimeLeft = totalDuration;
    let totalStageTime = stages.reduce((acc, stage) => acc + stage.time, 0);

    var displayText = document.getElementById('timerText');
    var breathingStage = document.getElementById('breathingStage');
    var progressCircle = document.getElementById('progressCircle');
    var fullCircle = 2 * Math.PI * 90; // Circumference of the circle

    clearInterval(window.timerInterval); // Clear any existing intervals

    function updateProgress(totalElapsed) {
        let progress = totalElapsed / totalDuration;
        let offset = fullCircle * progress;
        progressCircle.style.strokeDashoffset = fullCircle - offset;
    }

    let totalElapsed = 0;
    window.timerInterval = setInterval(function () {
        breathingStage.textContent = stages[currentStage].action + ": " + stageTimeLeft + "s";
        updateProgress(totalElapsed);

        stageTimeLeft--;
        totalElapsed++;
        totalTimeLeft--;

        if (stageTimeLeft < 0) {
            currentStage = (currentStage + 1) % stages.length;
            stageTimeLeft = stages[currentStage].time;
        }

        if (totalTimeLeft < 0) {
            clearInterval(window.timerInterval);
            displayText.textContent = "Done!";
            breathingStage.textContent = "Complete";
            progressCircle.style.strokeDashoffset = 0; // Complete the progress
        }
    }, 1000);
}
