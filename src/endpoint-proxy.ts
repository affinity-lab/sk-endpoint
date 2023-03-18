import type {RequestEvent} from "@sveltejs/kit";
import type {Decorator} from "@affinity-lab/sk-api-client/src/builder";
import type {AxiosRequestConfig} from "axios";
import axios from "axios";

export default class EndpointProxy {

	private readonly decorators: Decorator[] = [];
	constructor(private remoteUrl: string, private pathParam: string = "path") {}

	async pass(event: RequestEvent) {
		let config: AxiosRequestConfig = {
			url: this.remoteUrl + event.params[this.pathParam],
			method: event.request.method,
			params: event.url.searchParams,
			data: event.request.body,
			transformResponse: (r) => r
		}

		let request = axios.create();
		this.decorators.forEach(decorator => decorator.decorate(request, event))
		let result = await request.request(config);

		return new Response(result.data, {
			status: result.status,
			statusText: result.statusText,
			headers: result.headers as unknown as Headers
		});
	}
	addDecorator(decorator: Decorator) {this.decorators.push(decorator)}
}
