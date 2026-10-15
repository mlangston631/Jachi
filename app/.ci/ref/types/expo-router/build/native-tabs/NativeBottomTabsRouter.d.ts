import { RouterActionHandling } from '../react-navigation/native';
export declare const NativeBottomTabsRouter: (options: import("..").TabRouterOptions) => Omit<import("..").Router<import("..").TabNavigationState<import("../react-navigation").ParamListBase>, import("..").CommonNavigationAction | import("..").TabActionType>, "getStateForAction"> & {
    getStateForAction(state: import("..").TabNavigationState<import("../react-navigation").ParamListBase>, action: import("..").CommonNavigationAction | import("..").TabActionType, options: import("..").RouterConfigOptions): RouterActionHandling.Unhandled | import("..").RouterActionResult<import("..").TabNavigationState<import("../react-navigation").ParamListBase>>;
};
