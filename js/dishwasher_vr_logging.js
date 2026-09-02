window.DishwasherVRData = (function () {
    let rows = [];

    function reset() { rows = []; }
    function add(row) { rows.push(row); }

    function saveCSV() {
        if (!rows.length) return;
        const headers = [
            'event','time','gain','state','plate_number',
            'shoulder_x','shoulder_y','shoulder_z',
            'controller_x','controller_y','controller_z',
            'visual_y','arm_elevation_deg'
        ];
        const lines = [headers.join(',')];
        rows.forEach(function (row) {
            lines.push(headers.map(function (key) {
                const value = row[key] === undefined || row[key] === null ? '' : row[key];
                return String(value).replace(/,/g, '.');
            }).join(','));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dishwasher_vr_' + new Date().toISOString().replace(/[:.]/g, '-') + '.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return { reset, add, saveCSV };
})();
