if (!("DeviceDetailMap" in window)) {
    DeviceDetailMap = {};
    (function main(context) {
        let map, maxClusterZoomLevel = 8;
        let device = {};
        let datasource;

        ///                         ///
        ///     Public methods      ///
        ///                         ///

        context.LoadMap = function LoadMap(mapId, device, statuses) {
            this.device = device;

            //When there is no gps information, default to the map overview of The Netherlands
            let lon = 5.104480, lat = 52.092876, zoom = 6;
            if (device.longitude && device.latitude) {
                lon = device.longitude;
                lat = device.latitude;
                zoom = 15;
            }
            map = new atlas.Map(mapId, {
                center: [lon, lat],
                zoom: zoom,
                enableAccessibility: false,
                interactive: false,
                view: 'Auto',

                authOptions: {
                    authType: 'subscriptionKey',
                    subscriptionKey: 'ZPfVAvWxLXlFk6u8euXMzuK2k8VxkEhbrlB6UJxRqfg'
                }
            });

            map.events.add('ready', function configureMap() {
                addMapControls();
                if (device.longitude && device.latitude) {
                    addMapDataSource();
                    addFlagLayer(statuses);
                    generateMapPoint();
                }
            });
            // Prevents the cursor style from changing into a hand (the map isn't interactive)
            map.getCanvasContainer().style.cursor = 'default';
        };
        
        ///                         ///
        ///     Private methods     ///
        ///                         ///

        let addMapControls = function addMapControls() {
            let controls = [];
            //Get input options.
            const controlStyle = 'light';

            // Create a zoom control.
            controls.push(new atlas.control.ZoomControl({
                zoomDelta: 1,
                style: controlStyle
            }));

            // Create a style control and add it to the map.
            controls.push(new atlas.control.StyleControl());

            // Add controls to the map.
            map.controls.add(controls, {
                position: 'bottom-right'
            });
        };

        let addMapDataSource = function addMapDataSource() {
            datasource = new atlas.source.DataSource(null);
            map.sources.add(datasource);
        };

        let generateMapPoint = function generateMapPoint() {
            datasource.add(new atlas.data.Feature(
                new atlas.data.Point([context.device.longitude, context.device.latitude]), {
                    connectionState: context.device.connectionState,
                    DeviceId: context.device.deviceId,
                    location: context.device.location,
                    applicationState: context.device.applicationState,
                    project: context.device.project
                }));
        };

        const addFlagLayer = function addFlagLayer(statuses) {
            statuses.forEach(function (status) {
                map.imageSprite.add(`flag${status}`, `/images/${status}.png`).then(function () {
                    let flagLayer = new atlas.layer.SymbolLayer(datasource, `${status}_layer`, {
                        iconOptions: {
                            image: `flag${status}`,
                            anchor: 'center',
                            allowOverlap: true,
                            size: ['case', ['==', ['get', 'connectionState'], 'Disconnected'], 0.1, 0.07]
                        },
                        filter: addFlagLayerFilter(status)
                    });
                    map.layers.add(flagLayer);
                });
            });
        };

        // Sets the filter to display the correct flag
        /*
         * Checks whether a device is connected or not.
         * If it is connected, it will test the applicationState instead of the connectionState
         * The Running status is only for the UI.
         * Running includes three statuses: INFO,DEBUG and Connected.
         */
        const addFlagLayerFilter = function addFlagLayerFilter(status) {
            if (status === "Disconnected") {
                return ['all', ['!', ['has', 'point_count']], ['==', ['get', 'connectionState'], status]];
            } else {
                status = status.toUpperCase();
            }

            if (status === "RUNNING") {
                return ['all', ['!', ['has', 'point_count']],
                    ['match',
                        ['get', 'applicationState'],
                        ['INFO', 'DEBUG', 'Connected'],
                        ['==', ['get', 'connectionState'], 'Connected'],
                        false
                    ]
                ];
            }
            return ['all', ['!', ['has', 'point_count']], ['==', ['get', 'applicationState'], status], ['==', ['get', 'connectionState'], 'Connected']];
        };
    })(DeviceDetailMap)
}