window.ExperimentData = (function () {
    let rows = [];

    function reset() {
        rows = [];
    }

    function add(row) {
        rows.push(row);
    }

    function saveCSV() {
        let csv =
            'event,time_s,gain,' +
            'target_x,target_y,' +
            'real_x,real_y,' +
            'visual_x,visual_y,' +
            'error_m,error_cm,' +
            'pain_press\n';

        rows.forEach(function (row) {
            csv +=
                (row.event || 'frame') + ',' +
                Number(row.time).toFixed(4) + ',' +
                Number(row.gain).toFixed(2) + ',' +
                Number(row.target_x).toFixed(4) + ',' +
                Number(row.target_y).toFixed(4) + ',' +
                Number(row.real_x).toFixed(4) + ',' +
                Number(row.real_y).toFixed(4) + ',' +
                Number(row.visual_x).toFixed(4) + ',' +
                Number(row.visual_y).toFixed(4) + ',' +
                ((row.error_m === '' || row.error_m === undefined) ? '' : Number(row.error_m).toFixed(4)) + ',' +
                ((row.error_cm === '' || row.error_cm === undefined) ? '' : Number(row.error_cm).toFixed(2)) + ',' +
                (row.pain_press === undefined ? '' : row.pain_press) +
                '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'vuurvliegje_volgtaak.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    return { reset, add, saveCSV };
})();
