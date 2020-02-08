const LCMMapView = require("../js/mapview");
const fs = require('fs');
const path = require('path');
const mockPage = fs.readFileSync(path.resolve('Views/MapView/MapView.cshtml'), 'utf8');
global.atlas = {
    Map: jest.fn(),
    Popup: jest.fn(),
    events: jest.fn()
};
/* Resources needed for the Azure map, when the map is able to be tested these are needed */
/*atlas = "https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.js";
atlasService = "https://atlas.microsoft.com/sdk/javascript/service/2/atlas-service.min.js";
atlasCSS = "https://atlas.microsoft.com/sdk/javascript/mapcontrol/2/atlas.min.css";*/

const deviceConnectedError = {
    'deviceId': 'Device1',
    'location': 'DataLab',
    'longitude': 52.00,
    'latitude': 5.00,
    'connectionState': 'Connected',
    'applicationState': 'Error'
};
const deviceDisconnected = {
    'deviceId': 'Device1',
    'location': 'DataLab',
    'longitude': 52.00,
    'latitude': 5.00,
    'connectionState': 'Connected',
    'applicationState': 'ERROR'
};
const deviceConnectedWarning = {
    'deviceId': 'Device1',
    'location': 'DataLab',
    'longitude': 52.00,
    'latitude': 5.00,
    'connectionState': 'Connected',
    'applicationState': 'WARNING'
};
const deviceConnectedFatal = {
    'deviceId': 'Device1',
    'location': 'DataLab',
    'longitude': 52.00,
    'latitude': 5.00,
    'connectionState': 'Connected',
    'applicationState': 'FATAL'
};
const deviceConnectedRunning = {
    'deviceId': 'Device1',
    'location': 'DataLab',
    'longitude': 52.00,
    'latitude': 5.00,
    'connectionState': 'Connected',
    'applicationState': 'Running'
};
const devices = [deviceConnectedError, deviceDisconnected, deviceConnectedFatal, deviceConnectedWarning, deviceConnectedRunning];
const statuses = ["Error", "Warning", "Running", "Fatal"];
describe('The MapView', function mainMapViewTestSuite() {
    beforeAll(() => {
        document.body.innerHTML = mockPage;
        document.body.style.width = '500px';
        document.body.style.height = '500px';
        document.body.style.padding = '0';
        document.body.style.margin = '0';

    });
    afterEach(() => {
        document.body.innerHTML = mockPage;
    });

    describe('when loading the map', function loadingMapTestSuite() {
        it('should generate a map element', function generateMapTest() {
            //@TODO 05-12-2019 - Currently unable to mock / test the creation of the map. Someone should look into this in the future 
            // LCMMapView.LoadMap('lcmMap', devices, statuses);
        })
    })
})