(function () {
    const cfg = window.DISHWASHER_CONFIG;

    const scene = document.querySelector('#scene');
    const cursor = document.querySelector('#cursor');
    const waitingPlate = document.querySelector('#waitingPlate');
    const placedPlates = document.querySelector('#placedPlates');
    const carriedPlate = document.querySelector('#carriedPlate');

    const startButton = document.querySelector('#startButton');
    const saveButton = document.querySelector('#saveButton');
    const painButton = document.querySelector('#painButton');

    const statusText = document.querySelector('#statusText');
    const instructionText = document.querySelector('#instructionText');
    const taskText = document.querySelector('#taskText');
    const countdown = document.querySelector('#countdown');
    const timeText = document.querySelector('#timeText');
    const gainText = document.querySelector('#gainText');
    const realYText = document.querySelector('#realYText');
    const visualYText = document.querySelector('#visualYText');
    const plateCountText = document.querySelector('#plateCountText');
    const painCountText = document.querySelector('#painCountText');

    const pickupHint = document.querySelector('#pickupHint');
    const releaseHint = document.querySelector('#releaseHint');

    let experimentRunning = false;
    let countdownRunning = false;
    let experimentFinished = false;

    let startTime = 0;
    let lastLogTime = 0;

    let realY = cfg.referenceY;
    let state = 'WAITING_FOR_PICKUP';
    let plateNumber = 1;
    let placedCount = 0;
    let painCount = 0;

    let camera = null;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function getGain(t) {
        for (const stage of cfg.gainSchedule) {
            if (t < stage.until) return stage.gain;
        }
        return cfg.gainSchedule[cfg.gainSchedule.length - 1].gain;
    }

    function logEvent(eventName, elapsed, gain, visualY) {
        window.DishwasherData.add({
            event: eventName,
            time: elapsed,
            gain: gain,
            state: state,
            plate_number: plateNumber,
            real_y: realY,
            visual_y: visualY,
            pickup_threshold_y: cfg.pickupThresholdY,
            release_threshold_y: cfg.releaseThresholdY,
            pain_count: painCount
        });
    }

    function taskPointToScreen(x, y, z) {
        if (!camera && scene && scene.camera) camera = scene.camera;

        if (!camera) {
            return { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
        }

        const p = new THREE.Vector3(x, y, z);
        p.project(camera);

        return {
            x: (p.x * 0.5 + 0.5) * window.innerWidth,
            y: (-p.y * 0.5 + 0.5) * window.innerHeight
        };
    }

    function updateCarriedPlate(visualY) {
        if (state !== 'CARRYING_PLATE') {
            carriedPlate.style.display = 'none';
            return;
        }

        const p = taskPointToScreen(cfg.referenceX, visualY, cfg.handZ);
        carriedPlate.style.display = 'block';
        carriedPlate.setAttribute(
            'transform',
            `translate(${p.x.toFixed(1)} ${(p.y - 10).toFixed(1)}) rotate(-8)`
        );
    }

    function setWaitingPlateVisible(visible) {
        waitingPlate.setAttribute('visible', visible ? 'true' : 'false');
    }

    function addPlacedPlateVisual(number) {
        const plate = document.createElement('a-entity');
        const slot = (number - 1) % 7;
        const row = Math.floor((number - 1) / 7);
        const x = -0.84 + slot * 0.28;
        const y = cfg.shelfY + 0.14 + Math.min(row, 2) * 0.045;
        const z = -3.10 - Math.min(row, 2) * 0.03;

        plate.setAttribute('position', `${x.toFixed(2)} ${y.toFixed(2)} ${z.toFixed(2)}`);
        plate.setAttribute('rotation', '0 0 0');

        const circle = document.createElement('a-circle');
        circle.setAttribute('radius', '0.14');
        circle.setAttribute('color', '#f7f7f4');
        circle.setAttribute('material', 'side: double');
        plate.appendChild(circle);

        const ring = document.createElement('a-ring');
        ring.setAttribute('radius-inner', '0.085');
        ring.setAttribute('radius-outer', '0.105');
        ring.setAttribute('color', '#d5d6d2');
        ring.setAttribute('material', 'side: double');
        plate.appendChild(ring);

        placedPlates.appendChild(plate);
    }

    function resetTask() {
        realY = cfg.referenceY;
        state = 'WAITING_FOR_PICKUP';
        plateNumber = 1;
        placedCount = 0;
        painCount = 0;
        placedPlates.innerHTML = '';
        setWaitingPlateVisible(true);
        carriedPlate.style.display = 'none';
        plateCountText.innerText = 'Borden geplaatst: 0';
        painCountText.innerText = 'Aantal pijndrukken: 0';
        taskText.innerText = 'Beweeg naar beneden en pak het bord uit de vaatwasser.';
        pickupHint.style.display = 'block';
        releaseHint.style.display = 'block';
        window.ArmVisual.update(cfg.referenceX, cfg.referenceY, cfg.handZ);
    }

    document.addEventListener('mousemove', function (event) {
        if (!experimentRunning) return;

        realY -= event.movementY * cfg.mouseScaleY;
        realY = clamp(realY, cfg.minY, cfg.maxY);
    });

    function registerPainPress() {
        if (!experimentRunning) return;
        painCount++;
        painCountText.innerText = 'Aantal pijndrukken: ' + painCount;

        const elapsed = (performance.now() - startTime) / 1000;
        const gain = getGain(elapsed);
        const visualY = cfg.referenceY + gain * (realY - cfg.referenceY);
        logEvent('pain_press', elapsed, gain, visualY);
    }

    document.addEventListener('keydown', function (event) {
        if (event.code === 'KeyP' && !event.repeat) registerPainPress();
    });
    painButton.addEventListener('click', registerPainPress);

    function pickupPlate(elapsed, gain, visualY) {
        state = 'CARRYING_PLATE';
        setWaitingPlateVisible(false);
        taskText.innerText = 'Breng het bord omhoog en zet het op de plank.';
        logEvent('pickup', elapsed, gain, visualY);
    }

    function placePlate(elapsed, gain, visualY) {
        state = 'PLATE_PLACED';
        carriedPlate.style.display = 'none';
        placedCount++;
        plateCountText.innerText = 'Borden geplaatst: ' + placedCount;
        addPlacedPlateVisual(placedCount);
        taskText.innerText = 'Goed. Ga terug naar beneden voor het volgende bord.';
        logEvent('place', elapsed, gain, visualY);

        const completedPlate = plateNumber;
        setTimeout(function () {
            if (!experimentRunning) return;
            plateNumber = completedPlate + 1;
            state = 'WAITING_FOR_PICKUP';
            setWaitingPlateVisible(true);
            taskText.innerText = 'Beweeg naar beneden en pak het volgende bord.';
        }, cfg.respawnDelayMs);
    }

    function showCountdown() {
        countdownRunning = true;
        countdown.style.display = 'flex';
        statusText.innerText = 'Klaarmaken';
        instructionText.innerText = 'Pak steeds een bord beneden en zet het boven op de plank.';
        countdown.innerText = '3';

        setTimeout(function () { countdown.innerText = '2'; }, 1000);
        setTimeout(function () { countdown.innerText = '1'; }, 2000);
        setTimeout(function () { countdown.innerText = 'START'; }, 3000);

        setTimeout(function () {
            countdown.style.display = 'none';
            resetTask();
            window.DishwasherData.reset();
            startTime = performance.now();
            lastLogTime = startTime;
            experimentRunning = true;
            countdownRunning = false;
            experimentFinished = false;
            statusText.innerText = 'Experiment loopt';
            instructionText.innerText = 'Werk in een rustig, natuurlijk tempo.';
            startButton.disabled = true;
        }, 3500);
    }

    startButton.addEventListener('click', function () {
        if (experimentRunning || countdownRunning) return;
        document.body.requestPointerLock();
        saveButton.disabled = true;
        showCountdown();
    });

    function stopExperiment() {
        experimentRunning = false;
        experimentFinished = true;
        carriedPlate.style.display = 'none';

        if (document.pointerLockElement) document.exitPointerLock();

        statusText.innerText = 'Experiment klaar';
        instructionText.innerText = 'Je kunt de meetgegevens nu opslaan.';
        taskText.innerText = 'Test voltooid.';
        startButton.disabled = false;
        startButton.innerText = 'Opnieuw starten';
        saveButton.disabled = false;
    }

    function animate() {
        const now = performance.now();

        if (!experimentRunning) {
            if (!experimentFinished) {
                window.ArmVisual.update(cfg.referenceX, cfg.referenceY, cfg.handZ);
            }
            requestAnimationFrame(animate);
            return;
        }

        const elapsed = (now - startTime) / 1000;
        if (elapsed >= cfg.experimentDuration) {
            timeText.innerText = 'Tijd: 120.0 s / 120 s';
            stopExperiment();
            requestAnimationFrame(animate);
            return;
        }

        const gain = getGain(elapsed);
        const visualY = cfg.referenceY + gain * (realY - cfg.referenceY);

        window.ArmVisual.update(cfg.referenceX, visualY, cfg.handZ);
        updateCarriedPlate(visualY);

        if (state === 'WAITING_FOR_PICKUP' && realY <= cfg.pickupThresholdY) {
            pickupPlate(elapsed, gain, visualY);
        } else if (state === 'CARRYING_PLATE' && realY >= cfg.releaseThresholdY) {
            placePlate(elapsed, gain, visualY);
        }

        timeText.innerText = 'Tijd: ' + elapsed.toFixed(1) + ' s / 120 s';
        gainText.innerText = 'Gain: ' + gain.toFixed(2);
        realYText.innerText = 'Werkelijke Y: ' + realY.toFixed(3);
        visualYText.innerText = 'Getoonde Y: ' + visualY.toFixed(3);

        if (now - lastLogTime >= 16) {
            logEvent('frame', elapsed, gain, visualY);
            lastLogTime = now;
        }

        requestAnimationFrame(animate);
    }

    saveButton.addEventListener('click', window.DishwasherData.saveCSV);

    window.ArmVisual.init();
    resetTask();
    animate();
})();
