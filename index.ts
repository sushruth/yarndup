const lockContents = Deno.readTextFileSync("yarn.lock");

if (lockContents === null) {
  throw Error("File contents not there");
}

const parsedList = lockContents
  .match(/^\S(.*?):$/gm)
  ?.map((value) => value.replace(/("|:|\s)/gm, ""))
  .reduce((acc: Record<string, Set<string>>, entry) => {
    const values = entry.split(",");
    for (const value of values) {
      const versionMatches = value.match(/([^\s]*)@(.*?)$/);
      if (versionMatches) {
        const [, packageName, version] = versionMatches;
        if (acc[packageName]) {
          acc[packageName].add(version);
        } else {
          acc[packageName] = new Set([version]);
        }
      }
    }
    return acc;
  }, {});

const packageVersions: Record<string, string[]> = {};

for (const item in parsedList) {
  packageVersions[item] = Array.from(parsedList[item]);
}

Deno.writeTextFileSync(
  "yarn.duplicates.log.json",
  JSON.stringify(packageVersions, null, "  ")
);
