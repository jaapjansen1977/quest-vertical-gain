window.DishwasherData = (function () {
    let rows = [];

    function reset() {
        rows = [];
    }

    function add(row) {
        rows.push(row);
    }

    function saveCSV() {
        if (!rows.length) return;

        const headers = [
            'event', 'time', 'gain', 'state', 'plate_number',
            'real_y', 'visual_y', 'pickup_threshold_y', 'release_threshold_y'
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
        a.download = 'dishwasher_task_' + new Date().toISOString().replace(/[:.]/g, '-') + '.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return { reset, add, saveCSV };
})();
