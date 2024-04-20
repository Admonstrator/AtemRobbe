function startExercise(totalDuration) {
    const stages = [
        { action: "Inhale", time: 3, circleId: 'inhaleCircle' },
        { action: "Exhale", time: 5, circleId: 'exhaleCircle' },
        { action: "Pause", time: 5, circleId: 'pauseCircle' } // Adjusted pause time for demo purposes
    ];
    let currentStage = 0;
    let stageTimeLeft = stages[currentStage].time;
    let totalTimeLeft = totalDuration;
    let segmentFullDash = 565.48;

    var breathingStage = document.getElementById('breathingStage');
    var circles = stages.map(stage => document.getElementById(stage.circleId));

    function resetCircles() {
        circles.forEach(circle => {
            circle.style.strokeDashoffset = segmentFullDash;
        });
    }

    resetCircles(); // Initialize all circles as empty at start

    clearInterval(window.timerInterval); // Clear any existing intervals

    window.timerInterval = setInterval(function () {
        let progress = (stages[currentStage].time - stageTimeLeft) / stages[currentStage].time;
        let currentCircle = document.getElementById(stages[currentStage].circleId);
        currentCircle.style.strokeDashoffset = segmentFullDash * (1 - progress);

        breathingStage.textContent = stages[currentStage].action + ": " + stageTimeLeft + "s";

        stageTimeLeft--;
        totalTimeLeft--;

        if (stageTimeLeft < 0) {
            resetCircles(); // Reset all circles for next phase
            currentStage = (currentStage + 1) % stages.length;
            stageTimeLeft = stages[currentStage].time;
        }

        if (totalTimeLeft < 0) {
            clearInterval(window.timerInterval);
            breathingStage.textContent = "Complete";
            circles.forEach(circle => {
                circle.style.strokeDashoffset = 0; // Fill all circles to indicate completion
            });
        }
    }, 1000);
}
