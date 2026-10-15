import type { RequireContext } from '../types';
/** The `pathname` and `params` of the route that the server renders for `location`. */
export declare function getRouteInfoForLocation(context: RequireContext, location: URL): {
    pathname: string;
    params: import("..").UnknownOutputParams;
};
