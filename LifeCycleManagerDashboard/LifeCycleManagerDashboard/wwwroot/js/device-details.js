if (!("DeviceDetails" in window)) {
    const Utilities = require('./utilities');
    const Litepicker = require('litepicker');
    const moment = require('moment');
    const axios = require('axios').default;

    DeviceDetails = {};
    (function main(context) {
            let datePicker;

            let endpoint = '';
            let accessToken = '';
            let deviceId = '';

            let selectedDate = moment();
            let allLoggingLevels = [];
            let selectedLoggingLevels = [];
            let selectedLogListItem;

            let logs = [];
            let lastLogId = 0;

            let filtersApplied = false;

            /**
             * Sets the details used to communicate with the backend
             * @param _endpoint url to the backend endpoint
             * @param _accessToken access token to authorise
             * @param _deviceId ID of the requested device
             * @param loggingLevels representing the logging levels
             */
            context.SetupBackendInformation = function SetupBackendInformation(_endpoint, _accessToken, _deviceId, loggingLevels) {
                endpoint = _endpoint;
                accessToken = _accessToken;
                deviceId = _deviceId;
                allLoggingLevels = [...loggingLevels];
                selectedLoggingLevels = [...allLoggingLevels];
            };

            /**
             * Generate the html and add event listeners
             * @param supportedMethods list of strings representing the method names
             */
            context.SetupCommands = function SetupCommands(supportedMethods,) {
                const methodsList = document.getElementById('supported-methods-list');
                supportedMethods.forEach(method => {
                    methodsList.append(createCommandListItem(method));
                });
            };

            /**
             * Configures the UI for the filter options
             */
            context.SetupFiltersUI = function SetupFiltersUI() {
                clearLogMessagePane();
                setupDatePicker();
                setupLogLevelDropdown();
                addScrollEventListener();
                fetchLogs(false);
            };

            /**
             * Populates the list with logging messages
             * @param logs list of logging messages
             */
            context.PopulateLogList = function PopulateLogList(logs) {
                const list = document.getElementById('log-messages-list');
                list.innerHTML = '';
                if (logs.length !== 0) {
                    logs.forEach(log => {
                        list.append(createLogMessageListItem(log));
                    });
                } else {
                    const noLogsFound = {
                        loggingLevel: 'No log found',
                        dateTime: selectedDate.format('D MMM YYYY'),
                        message: `There are nog logs for the selected date: ${selectedDate.format('D MMM YYYY')}. Please select a different date.`
                    };
                    list.append(createLogMessageListItem(noLogsFound));
                }
                if (selectedLogListItem) {
                    const listItem = document.getElementById(selectedLogListItem.id);
                    listItem ? listItem.dispatchEvent(new Event('click')) : selectedLogListItem = null;
                }
            };

            /**
             * Displays the details of the logging message
             * @param logMessage selected message
             */
            context.ShowLogMessage = function ShowLogMessage(logMessage) {
                const date = moment(logMessage.dateTime);
                document.getElementById('log-messages-detail').innerHTML = `
                    <div class="log-messages-detail-header border-bottom w-100 ">
                        <div class="row no-gutters justify-content-between">
                            <p class="text-left">Logging level: ${logMessage.loggingLevel}</p>
                            <p class="text-left">Date: ${date.isValid() ? date.format("HH:mm:ss - dddd DD MMMM Y") : '...'}</p>
                            <p class="text-right">Message id: ${logMessage.id}</p>
                        </div>
                    </div>
                    <div class="log-messages-detail-body w-100 text-wrap">
                            <h5>Message:</h5>
                            <p class="text-monospace">${logMessage.message}</p>
                    </div>`;
            };

            /**
             * Applies the selected filters and fetches the logs
             */
            context.ApplyFilter = function ApplyFilter() {
                logs = [];
                lastLogId = -1;
                filtersApplied = true;
                fetchLogs(false);
                clearLogMessagePane();
            };

            /**
             * Fetches the logs from the backend
             * @param getNewerMessages false / true
             */
            const fetchLogs = function fetchLogs(getNewerMessages) {
                const body = {
                    selectedDate: selectedDate,
                    selectedLogId: selectedLogListItem ? selectedLogListItem.id : -1,
                    getNewerMessages: getNewerMessages,
                    filtersApplied: filtersApplied,
                    loggingLevels: selectedLoggingLevels,
                    lastLogId: lastLogId
                };
                Utilities.DisplayLoadingScreen();
                axios.post(`${endpoint}/api/messages/${deviceId}`, body, {headers: {"Authorization": `Bearer ${accessToken}`}})
                    .then(function (response) {
                        Utilities.HideLoadingScreen();
                        const result = response.data;
                        lastLogId = result.lastLogId;
                        updateDate(moment(result.selectedDate));
                        getNewerMessages === true ? logs.unshift(...result.loggingMessages) : logs.push(...result.loggingMessages);
                    })
                    .catch(() => {
                        logs = [];
                        context.PopulateLogList(logs)
                    })
                    .then(() => {
                        // Remove duplicates
                        logs = logs.filter((val, index, array) => array.findIndex(l => (l.id === val.id)) === index);
                        context.PopulateLogList(logs);
                        focusOnSelectedLog();
                    });
            };

            /**
             * Send the command to the LCM device
             * @param commandName name of the command
             */
            const sendCommand = function sendCommand(commandName) {
                let responseStatus, responseBody;
                const body = {
                    "deviceId": `${deviceId}`,
                    "command": `${commandName}`
                };
                Utilities.DisplayLoadingScreen();
                axios.post(`${endpoint}/api/commands`, body, {headers: {"Authorization": `Bearer ${accessToken}`}})
                    .then(function (response) {
                        switch (response.status) {
                            case 201:
                                responseStatus = 'Success';
                                responseBody = response.statusText;
                                break;
                            default:
                                responseStatus = 'Error';
                                responseBody = 'Unable to execute the command right now, please try again later';
                        }
                        Utilities.HideLoadingScreen();
                        displayModal(commandName, responseStatus, responseBody);
                    })
                    .catch(function (error) {
                        if (error.response) {
                            switch (error.response.status) {
                                case 408:
                                    responseStatus = 'Time-out';
                                    responseBody = 'The request timed out - 408';
                                    break;
                                // Method unavailable
                                case 400:
                                    responseStatus = 'Unavailable command';
                                    responseBody = `The command (${commandName}) is not available for this device - 400`;
                                    break;
                                // Device is offline
                                case 503:
                                    responseStatus = 'Device offline';
                                    responseBody = `The device (${deviceId}) is unavailable - 503`;
                                    break;
                                default:
                                    responseStatus = 'Error';
                                    responseBody = 'Unable to execute the command right now, please try again later';
                            }
                        }
                    })
                    .finally(() => {
                        Utilities.HideLoadingScreen();
                        displayModal(commandName, responseStatus, responseBody);
                    });

            };

            /**
             * Initializes the dropdown menu for the logging levels
             */
            const setupLogLevelDropdown = function setupLogLevelDropdown() {
                const dropdownItems = document.getElementById('log-level-dropdown-items');
                dropdownItems.addEventListener('click', function (e) {
                    e.stopPropagation();
                });
                dropdownItems.append(createLogLevelDropdownItem('ALL'));
                const divider = document.createElement('li');
                divider.className = "dropdown-divider";
                dropdownItems.append(divider);
                allLoggingLevels.forEach(level => {
                    dropdownItems.append(createLogLevelDropdownItem(level));
                });
            };

            /**
             * Initializes the date datePicker
             */
            const setupDatePicker = function setupDatePicker() {
                const datePickerBtn = document.getElementById('date-time-picker-logs');
                datePicker = new Litepicker({
                    element: datePickerBtn,
                    firstDay: 1, //1 = monday
                    autoApply: false,
                    singleMode: true,
                    onSelect: function (selection) {
                        const convertedDate = moment(selection);
                        if (!selectedDate.isSame(selection, 'day')) {
                            selectedLogListItem = null;
                        }
                        updateDate(convertedDate);
                    }
                });
                updateDate(selectedDate);
                datePickerBtn.addEventListener('click', function () {
                    datePicker.show();
                });
            };


            //////////////////////////////////////////////////////////
            ///                     UI Methods                     ///
            //////////////////////////////////////////////////////////

            /**
             * Clears the selected logging pane
             */
            const clearLogMessagePane = function clearLogMessagePane() {
                const emptyLog = {
                    loggingLevel: '...',
                    dateTime: '...',
                    id: '...',
                    message: 'Please select a logging message on the left.'
                };
                context.ShowLogMessage(emptyLog);
            };

            /**
             * Displays a modal when the request is finished to give feedback about the request
             * @param commandName name of the command
             * @param responseStatus status of the response
             * @param responseBody message
             */
            const displayModal = function displayModal(commandName, responseStatus, responseBody) {
                const modalRoot = document.getElementById('command-callback-modal');
                if (modalRoot.firstChild) {
                    modalRoot.removeChild(modalRoot.firstChild);
                }

                const modalContainer = document.createElement('div');
                modalContainer.className = "modal";
                modalContainer.id = "command-modal";
                modalContainer.tabIndex = -1;
                modalContainer.setAttribute('aria-labelledby', "modal-title-command-response");
                modalContainer.setAttribute('aria-hidden', "true");

                const modalDialog = document.createElement('div');
                modalDialog.className = "modal-dialog modal-dialog-centered";
                const modalContent = document.createElement('div');
                modalContent.className = "modal-content";
                const modalHeader = document.createElement('div');
                modalHeader.className = "modal-header";
                const modalBody = document.createElement('div');
                modalBody.className = "modal-body";
                const modalFooter = document.createElement('div');
                modalFooter.className = "modal-footer";

                const modalTitle = document.createElement('h5');
                modalTitle.className = "modal-title";
                modalTitle.id = "modal-title-command-response";
                modalTitle.innerHTML = responseStatus;

                modalBody.innerHTML = responseBody;

                const modalCloseButton = document.createElement('button');
                modalCloseButton.type = "button";
                modalCloseButton.className = "btn btn-secondary";
                modalCloseButton.setAttribute('data-dismiss', "modal");
                modalCloseButton.innerHTML = "Close";

                modalFooter.append(modalCloseButton);
                modalContent.append(modalHeader);
                modalContent.append(modalBody);
                modalContent.append(modalFooter);
                modalDialog.append(modalContent);
                modalContainer.append(modalDialog);

                modalRoot.append(modalContainer);

                $('#command-modal').modal();
            };

            /**
             * Updates the calendar and the UI
             * @param newDate to update the UI with
             */
            const updateDate = function updateDate(newDate) {
                selectedDate = moment().year(newDate.year()).month(newDate.month()).date(newDate.date());
                selectedDate.utc(false);
                selectedDate.startOf('day');
                const date = document.getElementById('logs-date-selected');
                date.innerHTML = selectedDate.format('D MMM YYYY')
            };


            /**
             * Create a command list item
             * @param method name of the command
             * @returns {HTMLAnchorElement} HTML element
             */
            const createCommandListItem = function createCommandListItem(method) {
                const listItem = document.createElement('a');
                listItem.className = "list-group-item list-group-item-action flex-column align-items-start";
                listItem.id = method;
                const commandContainer = document.createElement('div');
                commandContainer.className = "d-flex w-100 justify-content-between";
                const commandTitle = document.createElement('h5');
                commandTitle.className = "mb-1";
                commandTitle.innerHTML = method;
                commandContainer.append(commandTitle);
                listItem.append(commandContainer);
                listItem.addEventListener('click', function (event) {
                    sendCommand(method);
                });

                return listItem;
            };

            /**
             * Creates a logging message list item
             * @param log log message
             * @returns {HTMLAnchorElement} HTML element
             */
            const createLogMessageListItem = function createLogMessageListItem(log) {
                const listItem = document.createElement('a');
                listItem.className = "list-group-item list-group-item-action flex-column align-items-start";
                listItem.id = log.id;

                const loggingLevelContainer = document.createElement('div');
                loggingLevelContainer.className = "d-flex w-100 justify-content-between";

                const loggingLevelHeader = document.createElement('h5');
                loggingLevelHeader.className = "mb-1";
                loggingLevelHeader.innerHTML = log.loggingLevel;

                const date = moment(log.dateTime);
                const dateDiv = document.createElement('div');
                const loggingDate = document.createElement('small');
                loggingDate.innerHTML = date.format('D MMMM Y');
                dateDiv.append(loggingDate);

                const timeDiv = document.createElement('div');
                const loggingTime = document.createElement('small');
                loggingTime.innerHTML = date.format('HH:mm:ss');
                timeDiv.append(loggingTime);

                loggingLevelContainer.append(loggingLevelHeader);
                listItem.append(loggingLevelContainer);
                listItem.append(dateDiv);
                listItem.append(timeDiv);

                listItem.addEventListener('click', function (event) {
                    event.preventDefault();
                    context.ShowLogMessage(log);
                    if (selectedLogListItem && selectedLogListItem.id !== listItem.id) {
                        selectedLogListItem.classList.remove('active')
                    }
                    selectedLogListItem = listItem;
                    selectedLogListItem.classList.add("active");
                });
                return listItem;
            };

            /**
             * Creates a list item for the logging level dropdown
             * @param level the level for which the item is created
             * @returns {HTMLAnchorElement} HTML element
             */
            const createLogLevelDropdownItem = function createLogLevelDropdownItem(level) {
                const listItem = document.createElement('li');
                const label = document.createElement('label');
                let input = document.createElement('input');
                input.type = "checkbox";
                input.value = level;
                input.id = level;
                input.checked = true;
                createLogLevelEventListener(input, level);
                label.append(input);
                label.append(level);
                listItem.append(label);

                return listItem;
            };

            /**
             * Toggles all logging level checkboxes
             * @param checked value
             */
            const setStateCheckboxes = function setStateCheckboxes(checked) {
                const checkboxes = document.getElementById('log-level-dropdown-items').getElementsByTagName('input');
                for (let i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].checked = checked;
                }
            };

            const focusOnSelectedLog = function focusOnSelectedLog() {
                if (selectedLogListItem && filtersApplied) {
                    if (logs.findIndex(l => l.id === selectedLogListItem.id)) {
                        const logToScrollTo = document.getElementById(selectedLogListItem.id);
                        logToScrollTo.scrollIntoView({
                            block: "center",
                            behavior: "smooth"
                        });
                        logToScrollTo.dispatchEvent(new Event('click'))
                    } else {
                        selectedLogListItem = null;
                    }
                }
            };

            //////////////////////////////////////////////////////////
            ///                    Event Listeners                 ///
            //////////////////////////////////////////////////////////

            /**
             * Add an event listener to the scroll container to fetch new logs
             */
            const addScrollEventListener = function addScrollEventListener() {
                const scrollView = document.getElementById('log-messages-scroll-container');
                scrollView.addEventListener('scroll', function scrollViewEventListener() {
                    // Top
                    if (scrollView.scrollTop === 0) {
                        filtersApplied = false;
                        lastLogId = logs[0].id;
                        fetchLogs(true);

                    }

                    // Bottom
                    if (scrollView.scrollTop === (scrollView.scrollHeight - scrollView.offsetHeight)) {
                        filtersApplied = false;
                        lastLogId = logs[logs.length - 1].id;
                        fetchLogs(false);

                    }
                });
            };

            /**
             * Creates event listeners for the logging level checkboxes
             * @param input html element
             * @param level the logging level of the input
             */
            const createLogLevelEventListener = function createLogLevelEventListener(input, level) {
                input.addEventListener('change', function (event) {
                    const selectedLevel = event.target.defaultValue;
                    if (selectedLevel === 'ALL') {
                        if (event.target.checked) {
                            selectedLoggingLevels = [...allLoggingLevels];
                            setStateCheckboxes(true);
                        } else {
                            selectedLoggingLevels = [];
                            setStateCheckboxes(false);
                        }
                    } else {
                        const index = selectedLoggingLevels.indexOf(level);
                        if (index === -1) {
                            selectedLoggingLevels.push(level);
                        } else {
                            selectedLoggingLevels.splice(index, 1);
                        }
                    }

                    if (selectedLoggingLevels.length === 0) {
                        document.getElementById('btn-apply-log-filters').disabled = true;
                        document.getElementById('log-level-dropdown').innerHTML = 'None';
                        return;
                    }

                    document.getElementById('log-level-dropdown').innerHTML = selectedLoggingLevels.length === allLoggingLevels.length ? 'All' : selectedLoggingLevels;
                    document.getElementById('ALL').checked = selectedLoggingLevels.length === allLoggingLevels.length;
                    document.getElementById('btn-apply-log-filters').disabled = selectedLoggingLevels.length === 0;
                });
            };

        }
    )(DeviceDetails)
}

module.exports = DeviceDetails;