window.APP_CONFIG = {
    referenceX: 0,
    referenceY: 1.5,
    targetZ: -3.0,
    handZ: -2.8,

    // Alleen verticale muisbeweging wordt gebruikt.
    mouseScaleX: 0.0,
    mouseScaleY: 0.003,

    experimentDuration: 120,
    minX: 0,
    maxX: 0,
    minY: 0.55,
    maxY: 2.45,

    // Elke gainstap duurt 20 seconden.
    // 0-20: 1.00
    // 20-40: 0.95
    // 40-60: 0.90
    // 60-80: 0.85
    // 80-100: 0.80
    // 100-120: 0.75
    gainSchedule: [
        { until: 20, gain: 1.00 },
        { until: 40, gain: 0.95 },
        { until: 60, gain: 0.90 },
        { until: 80, gain: 0.85 },
        { until: 100, gain: 0.80 },
        { until: 120, gain: 0.75 }
    ],

    arm: {
        // FIRST-PERSON VISUALISATIE
        cameraY: 1.6,
        visualHandZ: -0.92,

        // Schouder/origin ligt bewust onder de onderrand en iets rechts.
        shoulder: { x: 0.22, y: 1.16, z: -0.34 },

        // Kleine knik zodat de arm niet mechanisch recht is.
        elbowBend: 0.055,

        upperArmRadius: 0.105,
        forearmRadius: 0.082,
        handScale: 2.15
    }
};
