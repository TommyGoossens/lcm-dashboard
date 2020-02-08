if (!("LCMMapView" in window)) {
    LCMMapView = {};
    (function (context) {
            const nationaalRegisterUrl = 'https://geodata.nationaalgeoregister.nl/bestuurlijkegrenzen/wfs?request=GetFeature&service=WFS&typeName=bestuurlijkegrenzen:provincies&outputFormat=json&srsName=EPSG:4326';
            let map, controls = [], maxClusterZoomLevel = 8, devicePopup;
            let deviceDataSource, provinceDataSource;
            let devices = [];
            let filteredProjects = [], filteredProvinces = [];

            ///                         ///
            ///     Public methods      ///
            ///                         ///

            // Loads all map settings
            context.LoadMap = function LoadMap(mapId, _devices, statuses) {
                devices = _devices;
                // Initialize a map instance.
                map = new atlas.Map(mapId, {
                    center: [5.104480, 52.092876],
                    zoom: 7,
                    enableAccessibility: true,
                    view: 'Auto',

                    authOptions: {
                        authType: 'subscriptionKey',
                        subscriptionKey: 'ZPfVAvWxLXlFk6u8euXMzuK2k8VxkEhbrlB6UJxRqfg'
                    }
                });
                devicePopup = new atlas.Popup();

                map.events.add('ready', function addMapEvents() {
                    // Add controls to the map (zoom and style controls).
                    addMapControls();

                    // Add data sources to the map containing the map points.
                    addMapDataSource();

                    // Retrieves the coordinates from the National GeoRegister and displays the boundaries
                    addProvinceBoundaries();

                    // Applies the cluster layer, so flags get grouped together.
                    setClusterLayer();

                    // Add the images to the map and an ID to filter on
                    addFlagLayer(statuses);

                    // Add map points of the devices
                    generateMapPoints(devices);
                });
                return map;
            };

            // Sets the focus on the selected LCM
            context.SetFocusOnDevice = function SetFocusOnDevice(lcm) {
                if (lcm.longitude && lcm.latitude) {
                    map.setCamera({
                        center: [lcm.longitude, lcm.latitude],
                        zoom: 13
                    });
                }
            };

            // Filter on flag type.
            context.FilterFlagType = function FilterFlagType(checkbox, status) {
                const layer = map.layers.getLayerById(`${status}_layer`);
                layer.setOptions({
                    visible: checkbox.checked
                });
            };

            // Populates the projects and provinces
            context.PopulateProjectsAndProvinces = function PopulateProjectsAndProvinces(projects, provinces) {
                filteredProjects = [...projects];
                filteredProvinces = [...provinces];

                // Empty strings to allow to display the devices without a project or province
                filteredProjects.push("");
                filteredProvinces.push("");
            };

            context.FilterDevices = function FilterDevices(filteredPropertyList, propertyToFilterOn) {
                if (propertyToFilterOn === 'project') {
                    filterProjects(filteredPropertyList);
                } else if (propertyToFilterOn === 'province') {
                    filterProvinces(filteredPropertyList);
                }
            };

            ///                         ///
            ///     Private methods     ///
            ///                         ///

            // Function to add the zoom and style control to the map.
            const addMapControls = function addMapControls() {
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

            // Parses the model and adds it as a deviceDataSource to the map.
            const addMapDataSource = function addMapDataSource() {
                deviceDataSource = new atlas.source.DataSource('Device data source', {
                    cluster: true,
                    clusterMaxZoom: maxClusterZoomLevel - 1,

                    clusterProperties: {
                        'ProblemDevices':
                            ['+',
                                ['case',
                                    ['any',
                                        ['==', ['get', 'connectionState'], 'Disconnected'],
                                        ['==', ['get', 'applicationState'], 'ERROR'],
                                        ['==', ['get', 'applicationState'], 'FATAL'],
                                    ],
                                    1,
                                    0
                                ]
                            ],
                        'WarningDevices':
                            ['+',
                                ['case',
                                    ['==', ['get', 'applicationState'], 'WARNING'],
                                    1,
                                    0
                                ]
                            ]
                    }
                });
                provinceDataSource = new atlas.source.DataSource('Province boundaries', {cluster: false});
                map.sources.add([deviceDataSource, provinceDataSource]);
            };

            // Generate map points from the data passed by the view.
            const generateMapPoints = function generateMapPoints(devices) {
                if (deviceDataSource) {
                    deviceDataSource.clear();
                }
                let disconnectedDevices = 0;
                let warnings = 0, fatals = 0, errors = 0, running = 0;
                for (let i = 0; i < devices.length; i++) {
                    deviceDataSource.add(new atlas.data.Feature(
                        new atlas.data.Point([devices[i].longitude, devices[i].latitude]), {
                            connectionState: devices[i].connectionState,
                            DeviceId: devices[i].deviceId,
                            location: devices[i].location,
                            applicationState: devices[i].applicationState,
                            project: devices[i].project
                        }));

                    if (devices[i].connectionState === "Disconnected") {
                        disconnectedDevices++;
                        continue;
                    }

                    switch (devices[i].applicationState) {
                        case "FATAL":
                            fatals++;
                            break;
                        case "WARNING":
                            warnings++;
                            break;
                        case "ERROR":
                            errors++;
                            break;
                        default:
                            running++;
                            break;
                    }
                }
                document.getElementById('devices-disconnected').innerHTML = `${disconnectedDevices}`;
                document.getElementById('devices-warning').innerHTML = `${warnings}`;
                document.getElementById('devices-fatal').innerHTML = `${fatals}`;
                document.getElementById('devices-error').innerHTML = `${errors}`;
                document.getElementById('devices-running').innerHTML = `${running}`;
            };

            // Applies the cluster layer, so flags get grouped together.
            const setClusterLayer = function setClusterLayer() {
                const clusterBubbleLayer = new atlas.layer.BubbleLayer(deviceDataSource, 'cluster_bubble_layer', {
                    radius: 12,
                    color: [
                        'case',
                        // If there is a device with the Disconnected, Error or Fatal status: return red.
                        ['>', ['get', 'ProblemDevices'], 0],
                        'red',
                        // If there is a device with the Warning status: return orange.
                        ['>', ['get', 'WarningDevices'], 0],
                        'orange',

                        // Otherwise return green.
                        'green'

                    ],
                    strokeColor: 'white',
                    strokeWidth: 2,

                    filter: ['has', 'point_count']
                });
                const clusterLabelLayer = new atlas.layer.SymbolLayer(deviceDataSource, 'cluster_label_layer', {
                    iconOptions: {
                        image: 'none'
                    },

                    textOptions: {
                        textField: ['get', 'point_count_abbreviated'],
                        size: 12,
                        font: ['StandardFont-Bold'],
                        offset: [0, 0.4],
                        color: 'white'
                    }
                });
                map.layers.add([clusterBubbleLayer, clusterLabelLayer]);
                setMouseCursorStyles(clusterBubbleLayer);
                map.events.add('click', clusterBubbleLayer, function (e) {
                    map.setCamera({
                        center: e.position,
                        zoom: map.getCamera().zoom + 2
                    })
                })
            };

            // Adds flag images to the map datasoruce and are mapped to the right status.
            const addFlagLayer = function addFlagLayer(statuses) {
                statuses.forEach(function (status) {
                    map.imageSprite.add(`flag${status}`, `/images/${status}.png`).then(function () {
                        let flagLayer = new atlas.layer.SymbolLayer(deviceDataSource, `${status}_layer`, {
                            iconOptions: {
                                image: `flag${status}`,
                                anchor: 'center',
                                allowOverlap: true,
                                size: ['case', ['==', ['get', 'connectionState'], 'Disconnected'], 0.1, 0.07]
                            },
                            filter: addFlagLayerFilter(status)
                        });
                        map.layers.add(flagLayer);

                        setMouseCursorStyles(flagLayer);
                        map.events.add('click', flagLayer, function (e) {
                            showDevicePopup(e.shapes[0]);
                        });
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

            // Generates the devicePopup and displays it
            const showDevicePopup = function showDevicePopup(lcm) {
                const props = lcm.getProperties();
                let html = `
                        <div class="card" style="width: 14rem">
                            <div class="card-header">
                            <div class="text-truncate float-left popup-header">
                                ${props['DeviceId']}
                                </div>
                                <a class="btn btn-outline-danger btn-sm m-0 p-1 float-right " id="close-device-popup">x</a>
                            </div>
                            <div class="card-body p-0 m-0 w-100">
                                <table class="table mb-0">
                                    <tbody>
                                        <tr class="d-flex">
                                            <td class="col-4">
                                                Project
                                            </td>
                                            <td class="col-8">
                                                ${props['project']}
                                            </td>
                                        </tr>
                                        <tr class="d-flex">
                                            <td class="col-4">
                                                Location
                                            </td>
                                            <td class="col-8">
                                                ${props['location']}
                                            </td>
                                        </tr>
                                        <tr class="d-flex">
                                            <td class="col-4">
                                                State
                                            </td>
                                            <td class="col-8">
                                                ${props['connectionState']}
                                            </td>
                                        </tr>
                                        <tr class="d-flex">
                                            <td class="col-4">
                                                Application
                                            </td>
                                            <td class="col-8">
                                                ${props['applicationState']}
                                            </td>
                                        </tr>
                                    </tbody>
                            </table>
                        </div>
                        <div class="card-footer text-center">
                            <button type="button" class="btn btn-primary btn-sm w-50" id="btn-${props['DeviceId']}">Info</button>
                        </div>
                    </div>`;
                devicePopup.setOptions({
                    content: html,
                    position: lcm.getCoordinates(),
                    closeButton: false
                });

                devicePopup.open(map);
                document.getElementById(`btn-${props['DeviceId']}`).onclick = function (e) {
                    directToDetails.call(this, props['DeviceId']);
                };
                document.getElementById('close-device-popup').onclick = function () {
                    devicePopup.close();
                };
            };

            // Directs the user to the detail page. Url is retrieved by requesting the value from the controller
            const directToDetails = function directToDetails(deviceId) {
                const url = document.getElementById('DirectToDetails').value;
                window.location.href = `${url}?deviceId=${deviceId}`;
            };

            // Changes the appearance of the cursor when the user hovers over
            const setMouseCursorStyles = function setMouseCursorStyles(layer) {
                //When the mouse is over the cluster and icon layers, change the cursor to a pointer.
                map.events.add('mouseover', layer, function () {
                    map.getCanvasContainer().style.cursor = 'pointer';
                });

                //When the mouse leaves the item on the cluster and icon layers, change the cursor back to the default (grab).
                map.events.add('mouseout', layer, function () {
                    map.getCanvasContainer().style.cursor = 'grab';
                });
            };

            // Add the selected projects to the list
            const filterProjects = function filterProjects(projects) {
                filteredProjects = [...projects];
                filterDevices();
            };

            // Add the selected provinces to the list.
            const filterProvinces = function filterProvinces(provinces) {
                filteredProvinces = [...provinces];
                updateProvinceBoundaries();
                filterDevices();
            };

            // Checks whether the devices are included in the filtered lists and generates map points
            const filterDevices = function filterDevices() {
                let filteredDevices = [];
                devices.forEach(device => {
                    if (filteredProjects.includes(device.project) && filteredProvinces.includes(device.address.countrySubdivision)) {
                        filteredDevices.push(device);
                    }
                });
                generateMapPoints(filteredDevices);
            };

            // Updates the UI to only display the selected provinces
            const updateProvinceBoundaries = function updateProvinceBoundaries() {
                // The data driven expressions can't handle an empty array, so one element is added
                if (filteredProvinces.length === 0) {
                    filteredProvinces = ["No provinces"]
                }
                map.layers.getLayerById('province-boundaries-fill').setOptions({
                    fillColor: [
                        'match',
                        ['get', 'provincienaam'],
                        filteredProvinces, 'rgba(30,144,255,0.32)', 'rgba(0,0,0,0)'
                    ]
                });
                map.layers.getLayerById('province-boundaries-outer').setOptions({
                    strokeColor: [
                        'match',
                        ['get', 'provincienaam'],
                        filteredProvinces, '#1e90ff', '#96969B'
                    ]
                });
            };

            // Retrieves the coordinates from the National GeoRegister and displays the boundaries
            const addProvinceBoundaries = function addProvinceBoundaries() {
                provinceDataSource.importDataFromUrl(nationaalRegisterUrl);
                // Fills the selected province with a blue color 
                const polygonLayer = new atlas.layer.PolygonLayer(provinceDataSource, 'province-boundaries-fill', {
                    fillColor: 'rgba(30,144,255,0.32)'
                });

                // Colours the outline of the province
                const lineLayer = new atlas.layer.LineLayer(provinceDataSource, 'province-boundaries-outer', {
                    strokeColor: '#1e90ff',
                    strokeWidth: 3,
                });

                map.layers.add([polygonLayer, lineLayer]);
            };
        }
    )(LCMMapView)
}

module.exports = LCMMapView;