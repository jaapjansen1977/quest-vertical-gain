window.DISHWASHER_VR_CONFIG = {
    experimentDuration: 120,
    gainSchedule: [
        { until: 20, gain: 1.00 },
        { until: 40, gain: 0.95 },
        { until: 60, gain: 0.90 },
        { until: 80, gain: 0.85 },
        { until: 100, gain: 0.80 },
        { until: 120, gain: 0.75 }
    ],

    // Alleen de verticale bewegingsuitslag wordt visueel gemanipuleerd.
    minVisualY: 0.35,
    maxVisualY: 2.8,

    // Taakdrempels relatief aan het tijdens de start vastgelegde referentiepunt.
    // Deze zijn bedoeld als eerste testwaarden en zijn later eenvoudig aan te passen.
    pickupOffsetY: -0.72,
    releaseOffsetY: 0.62,

    plateZ: -1.15,
    handZ: -1.05,
    respawnDelayMs: 450
};
