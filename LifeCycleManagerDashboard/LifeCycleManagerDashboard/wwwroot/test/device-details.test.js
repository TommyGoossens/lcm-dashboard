const DeviceDetails = require('../js/device-details');
const axios = require('axios').default;
const MockAdapter = require('axios-mock-adapter').default;
const axiosMock = new MockAdapter(axios);
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const mockPage = fs.readFileSync(path.resolve('wwwroot/test/mockpages/device-detail-mock-page.html'), 'utf8');

const mockendpoint = 'http://localhost';
const mockAccesstoken = 'Bearer accessToken';

const mockLogs = [
    {
        loggingLevel: 'ERROR',
        dateTime: new Date(),
        id: 1,
        message: 'Log message 1'
    }, {
        loggingLevel: 'INFO',
        dateTime: new Date(),
        id: 2,
        message: 'Log message 2'
    }
];

describe('DeviceDetails', function deviceDetailsMainTestSuite() {
    beforeEach(() => {
        document.body.innerHTML = mockPage;
        DeviceDetails.SetupBackendInformation(mockendpoint, mockAccesstoken, 'DeviceId', ['INFO', 'ERROR']);
        DeviceDetails.SetupFiltersUI();
        DeviceDetails.SetupCommands(['Reboot', 'Eject']);
    });
    describe('while setting up', function commandsTestSuite() {
        it('sets up the commands', function commandSetupTestCase() {

            const methodsList = document.getElementById('supported-methods-list');
            const methodsListItems = methodsList.getElementsByTagName('a');

            const reboot = methodsListItems[0].getElementsByTagName('h5')[0].innerHTML;
            expect(reboot).toBe('Reboot');
            const eject = methodsListItems[1].getElementsByTagName('h5')[0].innerHTML;
            expect(eject).toBe('Eject');
        });

        it('creates a dropdown with logging levels', function loggingLevelsDropdownTestCase() {
            const dropdown = document.getElementById('log-level-dropdown-items');
            const inputs = dropdown.getElementsByTagName('input');
            // INFO, ERROR + ALL
            expect(inputs.length).toBe(3);
        });

        it('clears the log messages pane', function clearLogMessagesPaneTestCase() {
            const logMessagePane = document.getElementById('log-messages-detail');
            const paragraphs = logMessagePane.getElementsByTagName('p');
            for (let i = 0; i < 3; i++) {
                expect(paragraphs[i].innerHTML.slice(-3)).toBe('...')
            }
            expect(paragraphs[3].innerHTML).toBe('Please select a logging message on the left.');
        });
    });

    describe('communication with the backend', function backendTestSuite() {
        describe('sending commands', function logsBackendTestSuite() {
            it('is possible to successfully send a command', function sendCommandTestCase() {
                axiosMock.onPost(`${mockendpoint}/api/commands`).reply(201, "Success!");
                const methodsList = document.getElementById('supported-methods-list');
                const methodsListItems = methodsList.getElementsByTagName('a');

                const reboot = methodsListItems[0].getElementsByTagName('h5')[0].innerHTML;
                expect(reboot).toBe('Reboot');
                methodsListItems[0].dispatchEvent(new Event('click'));

            });

            it('is possible to successfully handle a time-out', function sendCommandTestCase() {

                axiosMock.onPost(`${mockendpoint}/api/commands`).reply(408, "Time-out");
                const methodsList = document.getElementById('supported-methods-list');
                methodsList.getElementsByTagName('a')[0].dispatchEvent(new Event('click'));
                console.log(document.body.innerHTML);
            });

            it('is possible to send unavailable command', function sendCommandTestCase() {
                axiosMock.onPost(`${mockendpoint}/api/commands`).reply(400, 'Unavailable command');
                const methodsList = document.getElementById('supported-methods-list');
                methodsList.getElementsByTagName('a')[0].dispatchEvent(new Event('click'));
                let modal = document.getElementById('command-callback-modal');
            });

            it('is possible to send a command to an offline device', function sendCommandTestCase() {
                axiosMock.onPost(`${mockendpoint}/api/commands`).reply(503, 'Device offline');
                const methodsList = document.getElementById('supported-methods-list');
                methodsList.getElementsByTagName('a')[0].dispatchEvent(new Event('click'));
                const modal = document.getElementById('command-callback-modal');
            });
        });
    });

    describe('creating UI items', function uiElementsCreationTestSuite() {
        it('will create a log message list item', function logMessageItemCreationTestCase() {
            const list = document.getElementById('log-messages-list');
            DeviceDetails.PopulateLogList(mockLogs);

            const listItems = list.getElementsByTagName('a');
            expect(listItems.length).toBe(2);
        });

        it('will create a placeholder when no logs are available', function noAvailableLogsTestCase() {
            const list = document.getElementById('log-messages-list');
            DeviceDetails.PopulateLogList([]);
            const listItems = list.getElementsByTagName('a');
            expect(listItems.length).toBe(1);
            const header = listItems[0].getElementsByTagName('h5')[0];
            expect(header.innerHTML).toBe('No log found');
        });
    });

    describe('event listeners', function eventListenersTestSuite() {
        describe('regarding logging levels', function loggingLevelTestSuite() {
            let dropdownText;
            let checkboxAll;
            let checkboxError;
            let checkboxInfo;
            beforeEach(() => {
                dropdownText = document.getElementById('log-level-dropdown');
                checkboxAll = document.getElementById('ALL');
                checkboxError = document.getElementById('ERROR');
                checkboxInfo = document.getElementById('INFO');
            });
            it('will select everything when All is selected', function triggerSelectAllTestCase() {
                //There are spaces by default, not entirely sure why. This removes the spaces
                expect(dropdownText.innerHTML.replace(/\s+/g, '')).toBe('All');
                expect(checkboxAll.checked).toBe(true);
                expect(checkboxInfo.checked).toBe(true);
                expect(checkboxError.checked).toBe(true);
                checkboxAll.dispatchEvent(new Event('click'));

                expect(checkboxAll.checked).toBe(false);
                expect(checkboxInfo.checked).toBe(false);
                expect(checkboxError.checked).toBe(false);
                expect(dropdownText.innerHTML.replace(/\s+/g, '')).toBe('None');
                checkboxAll.dispatchEvent(new Event('click'));
                expect(dropdownText.innerHTML.replace(/\s+/g, '')).toBe('All');
            });
            it('will check All when all checkboxes are checked', function triggerDeselectAllTestCase() {
                //There are spaces by default, not entirely sure why. This removes the spaces
                expect(dropdownText.innerHTML.replace(/\s+/g, '')).toBe('All');

                checkboxAll.dispatchEvent(new Event('click'));
                expect(checkboxAll.checked).toBe(false);
                expect(checkboxInfo.checked).toBe(false);
                expect(checkboxError.checked).toBe(false);
                expect(dropdownText.innerHTML.replace(/\s+/g, '')).toBe('None');

                checkboxInfo.dispatchEvent(new Event('click'));
                checkboxError.dispatchEvent(new Event('click'));
                expect(dropdownText.innerHTML.replace(/\s+/g, '')).toBe('All');
            });
            it('changes the text of the button when clicking a level', function deselectingLoggingLevelButtonTestCase() {
                checkboxAll.dispatchEvent(new Event('click'));
                expect(checkboxAll.checked).toBe(false);
                expect(checkboxInfo.checked).toBe(false);
                expect(checkboxError.checked).toBe(false);
                expect(dropdownText.innerHTML.replace(/\s+/g, '')).toBe('None');

                checkboxError.dispatchEvent(new Event('click'));
                expect(dropdownText.innerHTML.replace(/\s+/g, '')).toBe('ERROR');

                checkboxError.dispatchEvent(new Event('click'));
                expect(dropdownText.innerHTML.replace(/\s+/g, '')).toBe('None');
            })
        });

        describe('regarding the log items', function logItemsTesSuite() {
            let messageList, firstLog, secondLog;
            beforeEach(() => {
                messageList = document.getElementById('log-messages-list');
                DeviceDetails.PopulateLogList(mockLogs);
                firstLog = messageList.getElementsByTagName('a')[0];
                secondLog = messageList.getElementsByTagName('a')[1];
            });
            it('changes the active element when clicking a log item', function changeActiveItemTestCase() {
                expect(firstLog.classList.contains('active')).toBe(false);
                expect(secondLog.classList.contains('active')).toBe(false);
                firstLog.dispatchEvent(new Event('click'));

                expect(firstLog.classList.contains('active')).toBe(true);
                expect(secondLog.classList.contains('active')).toBe(false);
                secondLog.dispatchEvent(new Event('click'));
                expect(firstLog.classList.contains('active')).toBe(false);
                expect(secondLog.classList.contains('active')).toBe(true);
            });
            it('displays a log item after clicking the logging message', function displayLoggingMessageTestCase() {
                firstLog.dispatchEvent(new Event('click'));
                const date = moment(mockLogs[0].dateTime);

                const logDetails = document.getElementById('log-messages-detail');
                const paragraphs = logDetails.getElementsByTagName('p');
                expect(paragraphs[0].innerHTML).toBe(`Logging level: ${mockLogs[0].loggingLevel}`);
                expect(paragraphs[1].innerHTML).toBe(`Date: ${date.format("HH:mm:ss - dddd DD MMMM Y")}`);
                expect(paragraphs[2].innerHTML).toBe(`Message id: ${mockLogs[0].id}`)

            });
        });
    });
})
;