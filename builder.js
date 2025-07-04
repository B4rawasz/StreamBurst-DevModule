import asar from "@electron/asar";
import fs from "fs";
import config from "./package.json" with { type: "json" };

if (fs.existsSync(`${config.name}.asar`)) {
	fs.rmSync(`${config.name}.asar`, { recursive: true, force: true });
}

asar.createPackage(".", `${config.name}.asar`);
