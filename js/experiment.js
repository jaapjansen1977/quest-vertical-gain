(function () {
    const cfg = window.APP_CONFIG;

    const target = document.querySelector('#target');
    const cursor = document.querySelector('#cursor');

    const fireflyBody = document.querySelector('#fireflyBody');
    const fireflyGlow = document.querySelector('#fireflyGlow');
    const fireflyLight = document.querySelector('#fireflyLight');
    const handGlow = document.querySelector('#handGlow');

    const startButton = document.querySelector('#startButton');
    const saveButton = document.querySelector('#saveButton');
    const painButton = document.querySelector('#painButton');
    const painRateText = document.querySelector('#painRateText');
    const painCountText = document.querySelector('#painCountText');

    const statusText = document.querySelector('#statusText');
    const instructionText = document.querySelector('#instructionText');
    const countdown = document.querySelector('#countdown');

    const timeText = document.querySelector('#timeText');
    const gainText = document.querySelector('#gainText');
    const realYText = document.querySelector('#realYText');
    const visualYText = document.querySelector('#visualYText');
    const errorText = document.querySelector('#errorText');
    const meanErrorText = document.querySelector('#meanErrorText');

    let experimentRunning = false;
    let countdownRunning = false;
    let experimentFinished = false;

    let startTime = 0;
    let lastLogTime = 0;

    let realX = cfg.referenceX;
    let realY = cfg.referenceY;

    let painPressTimes = [];
    let totalPainPresses = 0;

    let errorSum = 0;
    let errorCount = 0;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function getGain(t) {
        for (const stage of cfg.gainSchedule) {
            if (t < stage.until) return stage.gain;
        }
        return cfg.gainSchedule[cfg.gainSchedule.length - 1].gain;
    }

    function resetVisuals() {
        target.object3D.position.set(cfg.referenceX, cfg.referenceY, cfg.targetZ);
        window.ArmVisual.update(cfg.referenceX, cfg.referenceY, cfg.handZ);
    }

    document.addEventListener('mousemove', function (event) {
        if (!experimentRunning) return;

        realX += event.movementX * cfg.mouseScaleX;
        realY -= event.movementY * cfg.mouseScaleY;

        realX = clamp(realX, cfg.minX, cfg.maxX);
        realY = clamp(realY, cfg.minY, cfg.maxY);
    });

    function registerPainPress() {
        if (!experimentRunning) return;

        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        const gain = getGain(elapsed);

        painPressTimes.push(elapsed);
        totalPainPresses++;
        painCountText.innerText = 'Aantal pijndrukken: ' + totalPainPresses;

        window.ExperimentData.add({
            event: 'pain_press',
            time: elapsed,
            gain: gain,
            target_x: target.object3D.position.x,
            target_y: target.object3D.position.y,
            real_x: realX,
            real_y: realY,
            visual_x: cursor.object3D.position.x,
            visual_y: cursor.object3D.position.y,
            error_m: '',
            error_cm: '',
            pain_press: totalPainPresses
        });
    }

    document.addEventListener('keydown', function (event) {
        if (event.code === 'KeyP' && !event.repeat) {
            registerPainPress();
        }
    });

    painButton.addEventListener('click', registerPainPress);

    function showCountdown() {
        countdownRunning = true;
        countdown.style.display = 'flex';
        statusText.innerText = 'Kalibratie';
        instructionText.innerText = 'Bereid je voor. De hand start in het midden.';
        countdown.innerText = '3';

        setTimeout(function () { countdown.innerText = '2'; }, 1000);
        setTimeout(function () { countdown.innerText = '1'; }, 2000);
        setTimeout(function () { countdown.innerText = 'START'; }, 3000);

        setTimeout(function () {
            countdown.style.display = 'none';

            realX = cfg.referenceX;
            realY = cfg.referenceY;

            startTime = performance.now();
            lastLogTime = startTime;

            errorSum = 0;
            errorCount = 0;
            window.ExperimentData.reset();

            painPressTimes = [];
            totalPainPresses = 0;
            painRateText.innerText = 'Pijnfrequentie: 0.00 /s';
            painCountText.innerText = 'Aantal pijndrukken: 0';

            experimentRunning = true;
            countdownRunning = false;
            experimentFinished = false;

            statusText.innerText = 'Experiment loopt';
            instructionText.innerText = 'Volg het vuurvliegje zo nauwkeurig mogelijk.';
            startButton.disabled = true;
        }, 3500);
    }

    startButton.addEventListener('click', function () {
        if (experimentRunning || countdownRunning) return;

        document.body.requestPointerLock();

        realX = cfg.referenceX;
        realY = cfg.referenceY;
        resetVisuals();
        saveButton.disabled = true;
        showCountdown();
    });

    function stopExperiment() {
        experimentRunning = false;
        experimentFinished = true;

        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        statusText.innerText = 'Experiment klaar';
        instructionText.innerText = 'Je kunt de meetgegevens nu opslaan.';
        startButton.disabled = false;
        startButton.innerText = 'Opnieuw starten';
        saveButton.disabled = false;
    }

    function updateProximityFeedback(errorCm) {
        if (errorCm < 15) {
            fireflyBody.setAttribute('color', '#fff58a');
            fireflyBody.setAttribute('material', 'shader: standard; emissive: #fff58a; emissiveIntensity: 2.5');
            fireflyGlow.setAttribute('scale', '1.35 1.35 1.35');
            fireflyGlow.setAttribute('opacity', '0.45');
            fireflyLight.setAttribute('light', 'type: point; color: #fff58a; intensity: 1.8; distance: 3.5');
            handGlow.setAttribute('opacity', '0.22');
        } else {
            fireflyBody.setAttribute('color', '#ffe35a');
            fireflyBody.setAttribute('material', 'shader: standard; emissive: #ffd54a; emissiveIntensity: 1.8');
            fireflyGlow.setAttribute('scale', '1 1 1');
            fireflyGlow.setAttribute('opacity', '0.30');
            fireflyLight.setAttribute('light', 'type: point; color: #ffd85e; intensity: 1.2; distance: 3');
            handGlow.setAttribute('opacity', '0.15');
        }
    }

    function animate() {
        const now = performance.now();

        if (!experimentRunning) {
            if (!experimentFinished) resetVisuals();
            requestAnimationFrame(animate);
            return;
        }

        const elapsed = (now - startTime) / 1000;

        const painWindow = 2.0;
        const recentPresses = painPressTimes.filter(function (t) {
            return elapsed - t <= painWindow && elapsed - t >= 0;
        });
        const painRate = recentPresses.length / painWindow;
        painRateText.innerText = 'Pijnfrequentie: ' + painRate.toFixed(2) + ' /s';

        if (elapsed >= cfg.experimentDuration) {
            timeText.innerText = 'Tijd: ' + cfg.experimentDuration.toFixed(1) + ' s / ' + cfg.experimentDuration + ' s';
            stopExperiment();
            requestAnimationFrame(animate);
            return;
        }

        const gain = getGain(elapsed);

        const targetX =
            0.95 * Math.sin(elapsed * 0.85) +
            0.18 * Math.sin(elapsed * 2.3);

        const targetY =
            cfg.referenceY +
            0.55 * Math.sin(elapsed * 1.05) +
            0.12 * Math.cos(elapsed * 2.1);

        target.object3D.position.set(targetX, targetY, cfg.targetZ);

        const visualX = realX;
        const visualY = cfg.referenceY + gain * (realY - cfg.referenceY);

        window.ArmVisual.update(visualX, visualY, cfg.handZ);

        const dx = targetX - visualX;
        const dy = targetY - visualY;
        const errorMeters = Math.sqrt(dx * dx + dy * dy);
        const errorCm = errorMeters * 100;

        errorSum += errorCm;
        errorCount++;
        const meanErrorCm = errorSum / errorCount;

        updateProximityFeedback(errorCm);

        timeText.innerText =
            'Tijd: ' + elapsed.toFixed(1) + ' s / ' + cfg.experimentDuration + ' s';
        gainText.innerText = 'Gain: ' + gain.toFixed(2);
        realYText.innerText = 'Werkelijke Y: ' + realY.toFixed(3);
        visualYText.innerText = 'Getoonde Y: ' + visualY.toFixed(3);
        errorText.innerHTML = '<strong>Trackingfout: ' + errorCm.toFixed(1) + ' cm</strong>';
        meanErrorText.innerText = 'Gemiddelde fout: ' + meanErrorCm.toFixed(1) + ' cm';

        if (now - lastLogTime >= 16) {
            window.ExperimentData.add({
                event: 'frame',
                time: elapsed,
                gain: gain,
                target_x: targetX,
                target_y: targetY,
                real_x: realX,
                real_y: realY,
                visual_x: visualX,
                visual_y: visualY,
                error_m: errorMeters,
                error_cm: errorCm
            });
            lastLogTime = now;
        }

        requestAnimationFrame(animate);
    }

    saveButton.addEventListener('click', window.ExperimentData.saveCSV);

    window.ArmVisual.init();
    resetVisuals();
    animate();
})();
