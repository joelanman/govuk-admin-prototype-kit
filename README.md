# GOV.UK Tagging Prototype

## To start:

```
npm start
```

## To convert CSV:

Copy the CSV into the `resources` folder, and rename to `taxonomy.csv`

Run `node process-data`

This will create a `taxonomy.json` file in `resources`

## GOV.UK admin frontend notes

To replicate GOV.UK admin front end, this uses:

- Mincer in `server.js` to replicate Sprockets behaviour
- `bootstrap-sass` in `package.json`
- various front end libs copied to `/lib`
