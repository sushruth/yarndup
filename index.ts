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

const packageNameListAndResolvedVersion = /^\S.*:\s*\n\s*version "(.*?)"\s*$/gm;
const spacesAndNewlines = /\s*|\n*/g;
const quotes = /"|'/g;
const everythingAfterVersionTag = /(?!^)@(.*?)version(.*?)$/g;

const parsedList = lockContents
  .match(packageNameListAndResolvedVersion)
  ?.map((v) => v.replace(spacesAndNewlines, "").replace(quotes, ""))
  .reduce((acc: Record<string, string[]>, entry) => {
    const packageName = entry
      .split(",")[0]
      .replace(everythingAfterVersionTag, "");

    const version = entry.match(/:version(.*?)$/)?.[1];

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
    resolutions[entry] = parsedList[entry].sort(semver.rcompare)[0];
  }
}

Deno.writeTextFileSync(
  "yarn.duplicates.log.json",
  JSON.stringify({ multiples, resolutions }, null, "  ")
);

console.log('- yarn.duplicates.log.json generated')