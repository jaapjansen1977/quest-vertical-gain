(function () {
    const cfg = window.DISHWASHER_VR_CONFIG;
    const scene = document.querySelector('#scene');
    const rightController = document.querySelector('#rightController');
    const vrHand = document.querySelector('#vrHand');
    const waitingPlate = document.querySelector('#waitingPlate');
    const carriedPlate = document.querySelector('#carriedPlate3D');
    const placedPlates = document.querySelector('#placedPlates');
    const hudText = document.querySelector('#hudText');
    const statusText = document.querySelector('#statusText');
    const detailText = document.querySelector('#detailText');
    const saveButton = document.querySelector('#saveButton');

    let phase = 'CALIBRATE_SHOULDER';
    let shoulder = null;
    let startHand = null;
    let startTime = 0;
    let lastLog = 0;
    let plateNumber = 1;
    let placedCount = 0;
    let carrying = false;
    let waitingRespawn = false;

    const controllerWorld = new THREE.Vector3();

    function setHud(text) {
        hudText.setAttribute('value', text);
        statusText.textContent = text.replace(/\n/g, ' ');
    }

    function getGain(t) {
        for (const stage of cfg.gainSchedule) {
            if (t < stage.until) return stage.gain;
        }
        return cfg.gainSchedule[cfg.gainSchedule.length - 1].gain;
    }

    // Zelfde pose-uitlezing als in quest_controller_debug.html:
    // de A-Frame controllerentity wordt door WebXR bijgewerkt en we lezen
    // vervolgens zijn wereldpositie uit.
    function getRightControllerPose() {
        if (!scene.is('vr-mode')) return null;
        if (!rightController || !rightController.object3D) return null;

        rightController.object3D.getWorldPosition(controllerWorld);

        if (!Number.isFinite(controllerWorld.x) ||
            !Number.isFinite(controllerWorld.y) ||
            !Number.isFinite(controllerWorld.z)) {
            return null;
        }

        return {
            x: controllerWorld.x,
            y: controllerWorld.y,
            z: controllerWorld.z
        };
    }

    function armElevationDeg(controller) {
        if (!shoulder || !controller) return null;

        let vx = controller.x - shoulder.x;
        let vy = controller.y - shoulder.y;
        let vz = controller.z - shoulder.z;

        const len = Math.hypot(vx, vy, vz);
        if (len < 0.001) return null;

        vx /= len;
        vy /= len;
        vz /= len;

        // 0 deg = arm omlaag, 90 = horizontaal, 180 = recht omhoog.
        const dotDown = Math.max(-1, Math.min(1, -vy));
        return Math.acos(dotDown) * 180 / Math.PI;
    }

    function captureShoulder(controller) {
        shoulder = { ...controller };

        window.DishwasherVRData.reset();
        window.DishwasherVRData.add({
            event: 'shoulder_calibration',
            time: 0,
            gain: 1,
            state: 'CALIBRATED',
            plate_number: plateNumber,
            shoulder_x: shoulder.x,
            shoulder_y: shoulder.y,
            shoulder_z: shoulder.z,
            controller_x: controller.x,
            controller_y: controller.y,
            controller_z: controller.z,
            visual_y: '',
            arm_elevation_deg: 0
        });

        phase = 'WAIT_START';

        setHud(
            'Schouder opgeslagen.\n' +
            'Breng de hand naar de comfortabele startpositie\n' +
            'en druk opnieuw op de trigger.'
        );

        detailText.textContent =
            'Schouder: x ' + shoulder.x.toFixed(3) +
            ', y ' + shoulder.y.toFixed(3) +
            ', z ' + shoulder.z.toFixed(3);
    }

    function startExperiment(controller) {
        startHand = { ...controller };
        startTime = performance.now();
        lastLog = startTime;

        phase = 'RUNNING';
        plateNumber = 1;
        placedCount = 0;
        carrying = false;
        waitingRespawn = false;

        waitingPlate.setAttribute('visible', true);
        carriedPlate.setAttribute('visible', false);

        setHud(
            'Experiment loopt.\n' +
            'Beweeg omlaag om een bord te pakken\n' +
            'en omhoog om het op de plank te zetten.'
        );
    }

    function pickup(elapsed, controller, visualY, angle, gain) {
        carrying = true;
        waitingPlate.setAttribute('visible', false);
        carriedPlate.setAttribute('visible', true);

        window.DishwasherVRData.add({
            event: 'pickup',
            time: elapsed,
            gain: gain,
            state: 'CARRYING',
            plate_number: plateNumber,
            shoulder_x: shoulder.x,
            shoulder_y: shoulder.y,
            shoulder_z: shoulder.z,
            controller_x: controller.x,
            controller_y: controller.y,
            controller_z: controller.z,
            visual_y: visualY,
            arm_elevation_deg: angle
        });
    }

    function place(elapsed, controller, visualY, angle, gain) {
        carrying = false;
        placedCount++;
        carriedPlate.setAttribute('visible', false);

        const plate = document.createElement('a-cylinder');
        plate.setAttribute('radius', 0.15);
        plate.setAttribute('height', 0.025);
        plate.setAttribute('color', '#f8f8f3');
        plate.setAttribute('rotation', '90 0 0');
        plate.setAttribute(
            'position',
            (((placedCount - 1) % 6 - 2.5) * 0.12) + ' 0 0'
        );
        placedPlates.appendChild(plate);

        window.DishwasherVRData.add({
            event: 'place',
            time: elapsed,
            gain: gain,
            state: 'PLACED',
            plate_number: plateNumber,
            shoulder_x: shoulder.x,
            shoulder_y: shoulder.y,
            shoulder_z: shoulder.z,
            controller_x: controller.x,
            controller_y: controller.y,
            controller_z: controller.z,
            visual_y: visualY,
            arm_elevation_deg: angle
        });

        plateNumber++;
        waitingRespawn = true;

        setTimeout(function () {
            waitingPlate.setAttribute('visible', true);
            waitingRespawn = false;
        }, cfg.respawnDelayMs);
    }

    function stopExperiment() {
        phase = 'FINISHED';
        saveButton.disabled = false;
        setHud('Klaar. Verlaat VR om de CSV op te slaan.');
    }

    function handleTrigger() {
        const controller = getRightControllerPose();

        if (!controller) {
            setHud('Trigger ontvangen, maar controllerpositie nog niet beschikbaar.');
            return;
        }

        if (phase === 'CALIBRATE_SHOULDER') {
            captureShoulder(controller);
        } else if (phase === 'WAIT_START') {
            startExperiment(controller);
        }
    }

    // Dit event werkte ook in de controller-debugtest.
    rightController.addEventListener('triggerdown', handleTrigger);

    rightController.addEventListener('controllerconnected', function () {
        if (phase === 'CALIBRATE_SHOULDER') {
            setHud(
                'Rechter controller gevonden.\n' +
                'Houd hem tegen je rechterschouder\n' +
                'en druk op de trigger.'
            );
        }
    });

    scene.addEventListener('enter-vr', function () {
        phase = shoulder ? phase : 'CALIBRATE_SHOULDER';
        setHud(
            'Kalibratie:\n' +
            'houd de rechter controller tegen je rechterschouder\n' +
            'en druk op de trigger.'
        );
    });

    scene.addEventListener('exit-vr', function () {
        if (phase === 'RUNNING') {
            setHud('VR verlaten. De test is onderbroken.');
        }
    });

    saveButton.addEventListener('click', window.DishwasherVRData.saveCSV);

    function animate() {
        const controller = getRightControllerPose();

        if (controller && shoulder) {
            const angle = armElevationDeg(controller);
            const angleText = angle == null ? '--' : angle.toFixed(1);

            detailText.textContent =
                'Controller x ' + controller.x.toFixed(3) +
                '  y ' + controller.y.toFixed(3) +
                '  z ' + controller.z.toFixed(3) +
                ' | arm-elevatie ' + angleText + '°';
        }

        if (controller && phase === 'RUNNING') {
            const now = performance.now();
            const elapsed = (now - startTime) / 1000;

            if (elapsed >= cfg.experimentDuration) {
                stopExperiment();
                requestAnimationFrame(animate);
                return;
            }

            const gain = getGain(elapsed);
            const realY = controller.y;

            const visualY = Math.max(
                cfg.minVisualY,
                Math.min(
                    cfg.maxVisualY,
                    startHand.y + gain * (realY - startHand.y)
                )
            );

            // Alleen verticale visuele beweging:
            // X en Z blijven op de tijdens de start opgeslagen positie.
            vrHand.object3D.position.set(startHand.x, visualY, startHand.z);
            carriedPlate.object3D.position.set(
                startHand.x,
                visualY - 0.04,
                startHand.z - 0.02
            );

            const angle = armElevationDeg(controller);
            const pickupThreshold = startHand.y + cfg.pickupOffsetY;
            const releaseThreshold = startHand.y + cfg.releaseOffsetY;

            // Succescriteria blijven gebaseerd op de WERKELIJKE controller-Y.
            if (!carrying && !waitingRespawn && realY <= pickupThreshold) {
                pickup(elapsed, controller, visualY, angle, gain);
            }

            if (carrying && realY >= releaseThreshold) {
                place(elapsed, controller, visualY, angle, gain);
            }

            setHud(
                'Experiment loopt\n' +
                'Tijd ' + elapsed.toFixed(1) + ' / 120 s   Gain ' + gain.toFixed(2) + '\n' +
                'Borden geplaatst: ' + placedCount
            );

            if (now - lastLog >= 33) {
                window.DishwasherVRData.add({
                    event: 'frame',
                    time: elapsed,
                    gain: gain,
                    state: carrying ? 'CARRYING' : 'WAITING',
                    plate_number: plateNumber,
                    shoulder_x: shoulder.x,
                    shoulder_y: shoulder.y,
                    shoulder_z: shoulder.z,
                    controller_x: controller.x,
                    controller_y: controller.y,
                    controller_z: controller.z,
                    visual_y: visualY,
                    arm_elevation_deg: angle
                });

                lastLog = now;
            }
        }

        requestAnimationFrame(animate);
    }

    setHud('Klik eerst op VR. Daarna volgt de schouderkalibratie.');
    animate();
})();