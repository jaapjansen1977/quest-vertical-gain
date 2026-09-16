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

    // De trigger bepaalt nu pakken en loslaten.
    // Deze ruimtelijke waarden blijven alleen beschikbaar voor debug/latere analyse.
    pickupPoint: { x: 0.0, y: 0.58, z: -1.12 },
    pickupRadius: 0.35,
    pickupNearRadius: 0.50,

    releasePoint: { x: 0.0, y: 2.20, z: -1.30 },
    releaseRadius: 0.35,
    releaseNearRadius: 0.50,

    // Robuuste 3D-interactiezones (halve afmetingen, in meter).
    // Deze zijn bewust wat ruimer voor de eerste Quest-test.
    pickupHalfX: 0.45,
    pickupHalfY: 0.35,
    pickupHalfZ: 0.45,

    releaseHalfX: 0.45,
    releaseHalfY: 0.35,
    releaseHalfZ: 0.45,

    // Plankhoogte wordt na schouderkalibratie relatief ingesteld.
    // 0.25 m boven het opgeslagen schouderpunt is een eerste testwaarde.
    shelfOffsetFromShoulderY: 0.25,

    plateZ: -1.15,
    handZ: -1.05,
    respawnDelayMs: 450
};
