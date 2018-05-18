const fs = require('fs');

const map_filename = process.argv[2];
const tree_filename = process.argv[3];

const map = JSON.parse(fs.readFileSync(map_filename, 'utf8'));

const tree = JSON.parse(fs.readFileSync(tree_filename, 'utf8'));

let newick = tree['newick'];

Object.keys(map).forEach(function (key) {
    const true_name = map[key].replace('.json', '').replace('inputs/', '');
    newick = newick.replace(key, true_name);
});

process.stdout.write(newick + '\n');

