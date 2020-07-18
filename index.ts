import * as semver from "https://deno.land/x/semver/mod.ts";

type ParsedList = null | undefined | Record<string, string[]>;
type SuggestionLst = Record<string, string>;

let lockContents: string | undefined;
try {
  lockContents = Deno.readTextFileSync("yarn.lock");
} catch (error) {}

if (!lockContents) {
  throw Error("File contents not there");
}

const mainRegex = /^\S.*:\s*\n\s*version "(.*?)"\s*$/mg;

const parsedList = lockContents
  .match(mainRegex)
  ?.map(v => v.replace(/\s*|\n*/g, "").replace(/"/g, ""))
  .reduce((acc: Record<string, string[]>, entry) => {
    const packageName = entry.split(',')[0].replace(/(?!^)@(.*?)version(.*?)$/g, '');
    const version = entry.match(/:version(.*?)$/)?.[1];
    console.debug(entry.split(',')[0]);
    if (version) {
      if (acc[packageName] && !acc[packageName].includes(version)) {
        acc[packageName].push(version);
      } else {
        acc[packageName] = [version];
      }
    }
    return acc;
  }, {});

const multiples: ParsedList = {};
const resolutions: SuggestionLst = {};

for (const entry in parsedList) {
  if (parsedList[entry].length > 1) {
    multiples[entry] = parsedList[entry];
    resolutions[entry] = parsedList[entry].sort(semver.rcompare)[0]
  }
}

Deno.writeTextFileSync(
  "yarn.duplicates.log.json",
  JSON.stringify({ multiples, resolutions }, null, "  ")
);