const { paginateResults } = require('./utils');

module.exports = {
    Query: {
        // launches: (_: any, __: any, { dataSources }: any) =>
        //     dataSources.launchAPI.getAllLaunches(),
        launches: async (_: any, { pageSize = 20, after }: any, { dataSources }: any) => {
            const allLaunches = await dataSources.launchAPI.getAllLaunches();
            // we want these in reverse chronological order
            allLaunches.reverse();
            const launches = paginateResults({
                after,
                pageSize,
                results: allLaunches
            });
            return {
                launches,
                cursor: launches.length ? launches[launches.length - 1].cursor : null,
                // if the cursor at the end of the paginated results is the same as the
                // last item in _all_ results, then there are no more results after this
                hasMore: launches.length
                    ? launches[launches.length - 1].cursor !==
                    allLaunches[allLaunches.length - 1].cursor
                    : false
            };
        },
        launch: (_: any, { id }: any, { dataSources }: any) =>
            dataSources.launchAPI.getLaunchById({ launchId: id }),
        me: (_: any, __: any, { dataSources }: any) => dataSources.userAPI.findOrCreateUser(),
        // mission: (_: any, __: any, { dataSources }: any) => ({
        //     "name": "toto",
        //     "missionPatchSmall": "launch.links.mission_patch_small",
        //     "missionPatchLarge": "launch.links.mission_patch_large",
        // })
    },
    Mission: {
        // everytime we want to query mission with its name: it will display "toto"
        name: (obj: any) => "toto",
    },
    Launch: {
        // everytime we want to the site of a launch with its name: it will display "site"
        site: (obj: any) => "site"
    },
    Mutation: {
        login: async (_: any, { email }: any, { dataSources }: any) => {
            const user = await dataSources.userAPI.findOrCreateUser({ email });
            if (user) return Buffer.from(email).toString('base64');
        },
        bookTrips: async (_: any, { launchIds }: any, { dataSources }: any) => {
            const results = await dataSources.userAPI.bookTrips({ launchIds });
            const launches = await dataSources.launchAPI.getLaunchesByIds({
                launchIds,
            });

            return {
                success: results && results.length === launchIds.length,
                message:
                    results.length === launchIds.length
                        ? 'trips booked successfully'
                        : `the following launches couldn't be booked: ${launchIds.filter(
                            (id: any) => !results.includes(id),
                        )}`,
                launches,
            };
        },
        cancelTrip: async (_: any, { launchId }: any, { dataSources }: any) => {
            const result = await dataSources.userAPI.cancelTrip({ launchId });

            if (!result)
                return {
                    success: false,
                    message: 'failed to cancel trip',
                };

            const launch = await dataSources.launchAPI.getLaunchById({ launchId });
            return {
                success: true,
                message: 'trip cancelled',
                launches: [launch],
            };
        },
    },
};
