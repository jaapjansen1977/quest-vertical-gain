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
        // De arm begint bewust net onder de onderrand van het beeld,
        // iets rechts van het midden. Daardoor lijkt hij vanuit het lichaam
        // van de gebruiker het beeld in te komen.
        shoulder: { x: 0.72, y: -0.58, z: -2.72 },

        // Kleine laterale knik voor een natuurlijke ellebooglijn.
        elbowBend: 0.12,

        // Groter en voller dan de eerste versie, zodat de arm echt
        // een substantieel deel van het beeld inneemt.
        upperArmRadius: 0.15,
        forearmRadius: 0.115,
        handScale: 1.55
    }
};
