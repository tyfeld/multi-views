let data = null;
let data_file = './data/data.csv';

function get_min_max(data, attr) {
    let min = 1e9;
    let max = 0;
    data.forEach(d => {
        let v = parseInt(d[attr]);
        if (v > max)
            max = v;
        if (v < min)
            min = v;
    });
    //console.log('attr', attr, 'min', min, 'max', max);

    return [min, max];
}