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
        // FIRST-PERSON VISUALISATIE
        // De meet-/cursorcoordinaten blijven op het taakvlak (-2.8 m),
        // maar de arm wordt veel dichter bij de camera getekend.
        // Daardoor vult hij het beeld zoals een eigen arm dat doet.
        cameraY: 1.6,
        visualHandZ: -0.92,

        // Schouder/origin ligt bewust onder de onderrand en iets rechts.
        shoulder: { x: 0.22, y: 1.16, z: -0.34 },

        // Kleine knik zodat de arm niet mechanisch recht is.
        elbowBend: 0.055,

        // In meters; omdat de arm dicht bij de camera staat ogen deze fors.
        upperArmRadius: 0.105,
        forearmRadius: 0.082,
        handScale: 2.15
    }
};
