# Building MLST/cgMLST/NGSTAR

## About
The build.py script accepts the JSON produced by the MLST build script and produces a JSON for merging with the website
`tasks.json`.

## Example
```
python3 build.py -p latest_schemes.json > pw_configs.json
```