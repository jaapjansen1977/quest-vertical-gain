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

    function computeElbow(shoulderPos, handPos) {
        const midpoint = new THREE.Vector3().addVectors(shoulderPos, handPos).multiplyScalar(0.5);
        const line = new THREE.Vector3().subVectors(handPos, shoulderPos);

        // Subtiele knik, zodat de arm niet als één rechte staaf oogt.
        // De oorsprong ligt nu bewust onder de onderrand van het beeld.
        const perpendicular = new THREE.Vector3(line.y, -line.x, 0);
        if (perpendicular.lengthSq() > 0.000001) perpendicular.normalize();

        const bend = window.APP_CONFIG.arm.elbowBend;
        midpoint.add(perpendicular.multiplyScalar(bend));
        midpoint.z = (shoulderPos.z + handPos.z) * 0.5;

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

        const handScale = window.APP_CONFIG.arm.handScale || 1;
        cursor.object3D.scale.set(handScale, handScale, handScale);
    }

    function update(handX, handY, handZ) {
        if (!shoulder) init();

        const s = window.APP_CONFIG.arm.shoulder;
        const shoulderPos = new THREE.Vector3(s.x, s.y, s.z);
        const handPos = new THREE.Vector3(handX, handY, handZ);
        const elbowPos = computeElbow(shoulderPos, handPos);

        shoulder.object3D.position.copy(shoulderPos);
        elbow.object3D.position.copy(elbowPos);

        setCylinderBetween(
            upperArm,
            shoulderPos,
            elbowPos,
            window.APP_CONFIG.arm.upperArmRadius
        );

        setCylinderBetween(
            forearm,
            elbowPos,
            handPos,
            window.APP_CONFIG.arm.forearmRadius
        );

        const handScale = window.APP_CONFIG.arm.handScale || 1;
        cursor.object3D.scale.set(handScale, handScale, handScale);
        cursor.object3D.position.copy(handPos);
    }

    return { init, update };
})();
