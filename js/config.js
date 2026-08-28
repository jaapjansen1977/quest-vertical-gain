window.APP_CONFIG = {
    referenceX: 0,
    referenceY: 1.5,
    targetZ: -3.0,
    handZ: -2.8,

    mouseScaleX: 0.003,
    mouseScaleY: 0.003,

    experimentDuration: 40,
    minX: -1.8,
    maxX: 1.8,
    minY: 0.55,
    maxY: 2.45,

    gainSchedule: [
        { until: 10, gain: 1.00 },
        { until: 20, gain: 0.95 },
        { until: 30, gain: 0.90 },
        { until: 40, gain: 0.85 }
    ],

    arm: {
        shoulder: { x: 1.32, y: 0.62, z: -2.68 },
        elbowBend: 0.22,
        upperArmRadius: 0.085,
        forearmRadius: 0.072
    }
};
