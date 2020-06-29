import { RESTDataSource } from 'apollo-datasource-rest';

export class LaunchAPI extends RESTDataSource {
    constructor() {
        super();
        this.baseURL = 'https://api.spacexdata.com/v2/';
    }

    getAllLaunches = async () => {
        const response = await this.get('launches');
        return Array.isArray(response)
            ? response.map(launch => this.launchReducer(launch))
            : [];
    }

    launchReducer = (launch: any) => {
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
    }

    getLaunchById = async ({ launchId }: any) => {
        const response = await this.get('launches', { flight_number: launchId });
        return this.launchReducer(response[0]);
    }

    getLaunchesByIds = async ({ launchIds }: any) => {
        return Promise.all(
            launchIds.map((launchId: string) => this.getLaunchById({ launchId })),
        );
    }
}

module.exports = LaunchAPI;

