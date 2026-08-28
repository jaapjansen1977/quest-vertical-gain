window.ArmVisual = (function () {
    let scene;
    let camera;
    let cursor;
    let armShape;
    let elbowShape;
    let palmShape;
    let handShape;
    let fingers;

    function init() {
        scene = document.querySelector('#scene');
        cursor = document.querySelector('#cursor');
        armShape = document.querySelector('#armShape');
        elbowShape = document.querySelector('#elbowShape');
        palmShape = document.querySelector('#palmShape');
        handShape = document.querySelector('#handShape');
        fingers = Array.from(document.querySelectorAll('#handShape .finger'));

        camera = scene && scene.camera ? scene.camera : null;

        window.addEventListener('resize', function () {
            // Geen opgeslagen pixels nodig; update() gebruikt steeds actuele viewport-afmetingen.
        });
    }

    function taskPointToScreen(handX, handY, handZ) {
        if (!camera && scene && scene.camera) camera = scene.camera;

        if (!camera) {
            return {
                x: window.innerWidth * 0.5,
                y: window.innerHeight * 0.5
            };
        }

        const p = new THREE.Vector3(handX, handY, handZ);
        p.project(camera);

        return {
            x: (p.x * 0.5 + 0.5) * window.innerWidth,
            y: (-p.y * 0.5 + 0.5) * window.innerHeight
        };
    }

    function getPerpendicular(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        return { x: -dy / len, y: dx / len };
    }

    function offsetPoint(p, n, distance) {
        return {
            x: p.x + n.x * distance,
            y: p.y + n.y * distance
        };
    }

    function update(handX, handY, handZ) {
        if (!scene) init();
        if (!armShape || !palmShape) return;

        // Houd de onzichtbare A-Frame cursor exact in taakruimte voor logging.
        cursor.object3D.position.set(handX, handY, handZ);

        const hand = taskPointToScreen(handX, handY, handZ);

        // Shoulder/origin echt onderaan in beeld: niet in de 3D-wereld,
        // maar bewust in schermcoordinaten zoals een first-person arm.
        const shoulder = {
            x: window.innerWidth * 0.61,
            y: window.innerHeight + 135
        };

        // Elleboog hoog genoeg om een natuurlijke armboog te krijgen.
        // Hij volgt de hand, maar blijft dichter bij de onderrand.
        const elbow = {
            x: shoulder.x * 0.46 + hand.x * 0.54 + 75,
            y: shoulder.y * 0.46 + hand.y * 0.54 + 35
        };

        const nUpper = getPerpendicular(shoulder, elbow);
        const nFore = getPerpendicular(elbow, hand);

        // Breed bij schouder, smaller bij elleboog en pols.
        const shoulderHalf = Math.max(105, window.innerWidth * 0.07);
        const elbowUpperHalf = 68;
        const elbowForeHalf = 61;
        const wristHalf = 38;

        const sL = offsetPoint(shoulder, nUpper, shoulderHalf);
        const sR = offsetPoint(shoulder, nUpper, -shoulderHalf);
        const eUL = offsetPoint(elbow, nUpper, elbowUpperHalf);
        const eUR = offsetPoint(elbow, nUpper, -elbowUpperHalf);
        const eFL = offsetPoint(elbow, nFore, elbowForeHalf);
        const eFR = offsetPoint(elbow, nFore, -elbowForeHalf);
        const wL = offsetPoint(hand, nFore, wristHalf);
        const wR = offsetPoint(hand, nFore, -wristHalf);

        const d = [
            `M ${sL.x.toFixed(1)} ${sL.y.toFixed(1)}`,
            `L ${eUL.x.toFixed(1)} ${eUL.y.toFixed(1)}`,
            `Q ${elbow.x.toFixed(1)} ${elbow.y.toFixed(1)} ${eFL.x.toFixed(1)} ${eFL.y.toFixed(1)}`,
            `L ${wL.x.toFixed(1)} ${wL.y.toFixed(1)}`,
            `L ${wR.x.toFixed(1)} ${wR.y.toFixed(1)}`,
            `L ${eFR.x.toFixed(1)} ${eFR.y.toFixed(1)}`,
            `Q ${elbow.x.toFixed(1)} ${elbow.y.toFixed(1)} ${eUR.x.toFixed(1)} ${eUR.y.toFixed(1)}`,
            `L ${sR.x.toFixed(1)} ${sR.y.toFixed(1)}`,
            'Z'
        ].join(' ');

        armShape.setAttribute('d', d);
        elbowShape.setAttribute('cx', elbow.x);
        elbowShape.setAttribute('cy', elbow.y);
        elbowShape.setAttribute('r', 66);

        // Hand orienteren in de richting van de onderarm.
        const dx = hand.x - elbow.x;
        const dy = hand.y - elbow.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        handShape.setAttribute(
            'transform',
            `translate(${hand.x.toFixed(1)} ${hand.y.toFixed(1)}) rotate(${angle.toFixed(1)})`
        );

        palmShape.setAttribute('cx', 0);
        palmShape.setAttribute('cy', 0);
        palmShape.setAttribute('rx', 48);
        palmShape.setAttribute('ry', 43);

        const fingerDefs = [
            [24, -25, 70, -44],
            [30, -8, 82, -14],
            [29, 9, 78, 14],
            [22, 25, 64, 37],
            [5, 28, 33, 62]
        ];

        fingers.forEach(function (line, i) {
            const f = fingerDefs[i];
            line.setAttribute('x1', f[0]);
            line.setAttribute('y1', f[1]);
            line.setAttribute('x2', f[2]);
            line.setAttribute('y2', f[3]);
        });
    }

    return { init, update };
})();
