import {PathMatcher} from "pathor";
import type {RequestEvent} from "@sveltejs/kit";

type Endpoint = {
	GET?: (event: RequestEvent, params?: { [p: string]: any }) => Response,
	POST?: (event: RequestEvent, params?: { [p: string]: any }) => Response,
	PUT?: (event: RequestEvent, params?: { [p: string]: any }) => Response,
	PATCH?: (event: RequestEvent, params?: { [p: string]: any }) => Response,
	DELETE?: (event: RequestEvent, params?: { [p: string]: any }) => Response,
};
type Routes = { [r: string]: Endpoint };
type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export default class EndpointRouter {
	constructor(private api: Routes = {}, private pathParam: string = "path") {}
	route(event: RequestEvent): Response {
		let path: string = event.params[this.pathParam]!;
		let method: Method = event.request.method as Method;
		for (const pattern in this.api) {
			let matcher = new PathMatcher(pattern);
			let result = matcher.match(path);
			if (result !== undefined) {
				if (this.api[pattern][method] !== undefined) {
					return this.api[pattern][method]!(event, result)
				}
			}
		}
		return new Response(`endpoint not Found: <${method}> ${path}`, {status: 404})
	}

	add(api: Routes) { this.api = Object.assign(this.api, api);}
}