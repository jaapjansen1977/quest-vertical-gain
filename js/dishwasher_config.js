window.DISHWASHER_CONFIG = {
    referenceX: 0,
    referenceY: 1.5,
    targetZ: -3.0,
    handZ: -2.8,

    // Alleen verticale muisbeweging wordt gebruikt.
    mouseScaleY: 0.003,
    minY: 0.50,
    maxY: 2.50,

    experimentDuration: 120,

    // Zelfde gain-protocol als de huidige verticale test.
    gainSchedule: [
        { until: 20, gain: 1.00 },
        { until: 40, gain: 0.95 },
        { until: 60, gain: 0.90 },
        { until: 80, gain: 0.85 },
        { until: 100, gain: 0.80 },
        { until: 120, gain: 0.75 }
    ],

    // Taakcriteria worden bewust op de WERKELIJKE Y-positie toegepast.
    pickupThresholdY: 0.76,
    releaseThresholdY: 2.16,

    // Visuele posities in de 3D-scène.
    plateHome: { x: 0, y: 0.66, z: -3.0 },
    shelfY: 2.20,

    // Na succesvol plaatsen verschijnt kort daarna een nieuw bord onderin.
    respawnDelayMs: 500
};
