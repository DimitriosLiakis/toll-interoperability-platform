const Table = require('cli-table');

function formatTable(data) {
    const table = new Table({
        head: Object.keys(data[0]),
        colWidths: [20, 20, 20],
    });

    data.forEach(row => table.push(Object.values(row)));
    return table.toString();
}

module.exports = { formatTable };

