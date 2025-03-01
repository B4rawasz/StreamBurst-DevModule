import { EventEmitter } from "events";
import http from "http";
import fs from "fs";
import { createHttpTerminator } from "http-terminator";

class ExampleModule extends EventEmitter {
	constructor() {
		super();
		this.enabled = false;
		this.settingsPath = "./settings_template.json";
		this.settings = null;
		this.server = null;
	}

	setSettingsPath(settingsPath) {
		this.settingsPath = settingsPath;
	}

	enable() {
		if (this.enabled) {
			this.emit("error", "[Dev Module] Already enabled");
			return;
		}

		this.enabled = true;

		this.settings = JSON.parse(fs.readFileSync(this.settingsPath)).settings;

		this.emit("debug", "[Dev Module] Enabling");
		this.emit("debug", "[Dev Module] Settings path: " + this.settingsPath);
		this.emit("debug", "[Dev Module] host: " + this.settings.host.value);
		this.emit("debug", "[Dev Module] port: " + this.settings.port.value);

		this.server = http.createServer((req, res) => {
			if (req.method == "POST") {
				res.writeHead(200, { "Content-Type": "text/html" });

				var body = "";
				req.on("data", function (data) {
					body += data;
				});
				req.on("end", () => {
					switch (req.url) {
						case "/":
							this.emit("event", body);
							break;
						case "/debug":
							this.emit("debug", body);
							break;
						case "/error":
							this.emit("error", body);
							break;
						default:
							break;
					}

					res.end("ok");
				});
			} else {
				res.writeHead(200, { "Content-Type": "text/html" });
				var html =
					"<html><body>HTTP Server at http://" +
					this.settings.host.value +
					":" +
					this.settings.port.value +
					"</body></html>";
				res.end(html);
			}
		});

		this.server.listen(this.settings.port.value, this.settings.host.value);
	}

	disable() {
		if (!this.enabled) {
			this.emit("error", "[Dev Module] Already disabled");
			return;
		}

		this.emit("debug", "[Dev Module] Disabling");

		this.enabled = false;

		const terminator = createHttpTerminator({ server: this.server });
		terminator.terminate();
	}
}

// Export the instance of the class as the default export
export default new ExampleModule();
