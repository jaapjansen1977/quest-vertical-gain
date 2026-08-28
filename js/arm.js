window.ArmVisual = (function () {
    let shoulder;
    let elbow;
    let upperArm;
    let forearm;
    let cursor;

    function setCylinderBetween(entity, a, b, radius) {
        const midpoint = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(b, a);
        const length = direction.length();

        if (length < 0.001) return;

        entity.object3D.position.copy(midpoint);
        entity.setAttribute('height', length);
        entity.setAttribute('radius', radius);

        const up = new THREE.Vector3(0, 1, 0);
        entity.object3D.quaternion.setFromUnitVectors(up, direction.clone().normalize());
    }

    function projectTaskPointToForeground(handX, handY, taskZ) {
        const cfg = window.APP_CONFIG.arm;
        const nearZ = cfg.visualHandZ;

        // Zelfde beeld-/schermpositie als het punt op het taakvlak,
        // maar dichter bij de camera. Hierdoor blijft de hand optisch
        // bij dezelfde cursorpositie terwijl hij veel groter oogt.
        const ratio = Math.abs(nearZ / taskZ);
        const x = handX * ratio;
        const y = cfg.cameraY + (handY - cfg.cameraY) * ratio;

        return new THREE.Vector3(x, y, nearZ);
    }

    function computeElbow(shoulderPos, handPos) {
        const midpoint = new THREE.Vector3().addVectors(shoulderPos, handPos).multiplyScalar(0.5);
        const line = new THREE.Vector3().subVectors(handPos, shoulderPos);

        const perpendicular = new THREE.Vector3(line.y, -line.x, 0);
        if (perpendicular.lengthSq() > 0.000001) perpendicular.normalize();

        midpoint.add(perpendicular.multiplyScalar(window.APP_CONFIG.arm.elbowBend));

        // Elleboog iets dichter bij de gebruiker dan puur lineair midden.
        midpoint.z += 0.06;

        return midpoint;
    }

    function init() {
        shoulder = document.querySelector('#shoulderJoint');
        elbow = document.querySelector('#elbowJoint');
        upperArm = document.querySelector('#upperArm');
        forearm = document.querySelector('#forearm');
        cursor = document.querySelector('#cursor');

        const s = window.APP_CONFIG.arm.shoulder;
        shoulder.object3D.position.set(s.x, s.y, s.z);

        const scale = window.APP_CONFIG.arm.handScale;
        cursor.object3D.scale.set(scale, scale, scale);
    }

    function update(handX, handY, handZ) {
        if (!shoulder) init();

        const cfg = window.APP_CONFIG.arm;
        const s = cfg.shoulder;
        const shoulderPos = new THREE.Vector3(s.x, s.y, s.z);
        const handPos = projectTaskPointToForeground(handX, handY, handZ);
        const elbowPos = computeElbow(shoulderPos, handPos);

        shoulder.object3D.position.copy(shoulderPos);
        elbow.object3D.position.copy(elbowPos);

        setCylinderBetween(upperArm, shoulderPos, elbowPos, cfg.upperArmRadius);
        setCylinderBetween(forearm, elbowPos, handPos, cfg.forearmRadius);

        cursor.object3D.position.copy(handPos);
    }

    return { init, update };
})();
