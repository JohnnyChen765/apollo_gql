"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaunchAPI = void 0;
const apollo_datasource_rest_1 = require("apollo-datasource-rest");
class LaunchAPI extends apollo_datasource_rest_1.RESTDataSource {
    constructor() {
        super();
        this.getAllLaunches = async () => {
            const response = await this.get('launches');
            return Array.isArray(response)
                ? response.map(launch => this.launchReducer(launch))
                : [];
        };
        this.launchReducer = (launch) => {
            return {
                id: launch.flight_number || 0,
                site: launch.launch_site && launch.launch_site.site_name,
                mission: {
                    name: launch.mission_name,
                    missionPatchSmall: launch.links.mission_patch_small,
                    missionPatchLarge: launch.links.mission_patch,
                },
                rocket: {
                    id: launch.rocket.rocket_id,
                    name: launch.rocket.rocket_name,
                    type: launch.rocket.rocket_type,
                },
            };
        };
        this.getLaunchById = async ({ launchId }) => {
            const response = await this.get('launches', { flight_number: launchId });
            return this.launchReducer(response[0]);
        };
        this.getLaunchesByIds = async ({ launchIds }) => {
            return Promise.all(launchIds.map((launchId) => this.getLaunchById({ launchId })));
        };
        this.baseURL = 'https://api.spacexdata.com/v2/';
    }
}
exports.LaunchAPI = LaunchAPI;
module.exports = LaunchAPI;
