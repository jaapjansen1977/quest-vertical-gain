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

    // Interactie gebeurt nu ruimtelijk: de echte controller moet in de
    // grijp-/plaatsingszone komen. De gain bepaalt alleen de VISUELE Y.
    pickupPoint: { x: 0.0, y: 0.58, z: -1.12 },
    pickupRadius: 0.22,
    pickupNearRadius: 0.38,

    releasePoint: { x: 0.0, y: 2.20, z: -1.30 },
    releaseRadius: 0.24,
    releaseNearRadius: 0.42,

    plateZ: -1.15,
    handZ: -1.05,
    respawnDelayMs: 450
};
