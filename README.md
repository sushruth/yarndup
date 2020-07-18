## Yarn package multiple version finder

The name is not fully representative of what this tool does. I am bad at naming. Here is what this tool will do - it shows all versions of a package used in your `yarn.lock`.

### Usage

Run this - 

```
deno run --allow-read --allow-write https://raw.githubusercontent.com/sushruth/yarndup/master/index.ts
```

and now check for `yarn.duplicates.log.json`

> WARNING: this tool only tries to pin the resolution on the latest version required for any package. Does not guarantee operation without issues.