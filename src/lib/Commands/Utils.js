import { existsSync, readFileSync } from "fs";

export const REGEX_TYPE = /\.(js|ts)/;

export const ALLOWED_TYPES = ["js", "ts"];

export const SAMPLEFOLDER = `${__dirname}/../../resources`;
export const GETSAMPLE = sample =>
    existsSync(`${SAMPLEFOLDER}/${sample}`)
        ? readFileSync(`${SAMPLEFOLDER}/${sample}`, { encoding: "utf8" })
        : null;

export const SNAKECASEFY = name =>
    name
        .split("")
        .map((w, i) => (/[A-Z]/.test(w) && i > 0 ? `_${w}` : w))
        .join("")
        .toLowerCase();
