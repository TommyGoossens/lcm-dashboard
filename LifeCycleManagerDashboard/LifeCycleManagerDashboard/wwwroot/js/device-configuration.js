if (!("DeviceConfiguration" in window)) {
    const DeviceConfigurationUI = require('./device-configuration-ui');
    const Utilities = require('./utilities');
    DeviceConfiguration = {};
    (function main(context) {
        const Http = new XMLHttpRequest();
        let saveChangesButton, discardChangesButton;
        let originalConfig, newConfig;
        // DOM elements
        let modalBody, modalSaveButton, jsonField;

        /**
         * Creates a copy of the original json structure to rollback to, when changes are discarded
         * @param config original json
         */
        context.SetOriginalConfig = function SetOriginalConfig(config) {
            setupDOMElements();
            originalConfig = config;
            // Easiest way to copy an object instead of copying the reference
            newConfig = JSON.parse(JSON.stringify(originalConfig));
        };

        /**
         *  Displays a new modal instance
         * @param template containing the keys (if any) of the selected json object
         * @param fieldName
         */
        context.CreateModal = function CreateModal(template, fieldName) {
            setupModalButtons(fieldName);
            modalBody.innerHTML = '';
            template.forEach(key => {
                context.AddNewRow(key);
            });
            $('#add-object-modal').modal();
        };

        /**
         * Discard the changes and resets the UI
         */
        context.DiscardChanges = function DiscardChanges() {
            newConfig = JSON.parse(JSON.stringify(originalConfig));
            updateUI();
        };


        /**
         *  Send the updated configuration to the Moxa
         * @param endpoint of the backend
         * @param accessToken used for authorisation
         */
        context.PersistChanges = function PersistChanges(endpoint, accessToken) {
            newConfig.NumberOfIOControllers = newConfig.IOControllers.length;
            newConfig.NumberOfPrograms = newConfig.Programs.length;
            newConfig.NumberOfPowerSupplies = newConfig.PowerSupplies.length;

            Http.open('POST', `${endpoint}`);
            Http.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            Http.setRequestHeader("Content-Type", "application/json");
            const data = {
                configuration: newConfig
            };
            
            Http.send(JSON.stringify(data, null, 0));
            Utilities.DisplayLoadingScreen();
            Http.onreadystatechange = function readyStateChangePostRequest() {
                if (this.readyState === XMLHttpRequest.DONE) {
                    Utilities.HideLoadingScreen();
                    if (Http.status === 201) {
                        alert('The configuration has successfully been updated. The device is now restarting to apply the changes.');
                        originalConfig = JSON.parse(Http.responseText);
                        newConfig = JSON.parse(Http.responseText);
                        updateUI();
                    } else {
                        alert('The update was unsuccessful, please check your input or try again');
                        updateUI();
                    }
                }
            }
        };


        /**
         * Adds a new row to the modal
         * @param keyName name of the property
         */
        context.AddNewRow = function AddNewRow(keyName) {
            const listItem = DeviceConfigurationUI.createPropertyInputListItem(keyName);
            modalBody.appendChild(listItem);
            bindDeleteEvent(listItem)
        };

        const removeRow = function removeRow(event) {
            const listItem = event.parentNode;
            const ul = listItem.parentNode;
            ul.removeChild(listItem);
        };

        const bindDeleteEvent = function bindDeleteEvent(propertyListItem) {
            const deleteButton = propertyListItem.querySelector("button.delete");
            deleteButton.addEventListener('click', function deleteRowButtonEventListener() {
                removeRow(deleteButton);
            })
        };

        const saveUpdatedProperty = function saveUpdatedProperty(event) {
            const properties = event.parentNode.parentNode;
            let updatedProps = {};
            for (let prop of properties.getElementsByTagName('li')) {
                if (prop.getElementsByTagName('button').length > 0) continue;
                const propName = prop.getElementsByTagName('p')[0].innerHTML;
                updatedProps[propName] = Utilities.GetTypedValue(prop.getElementsByTagName('input')[0].value);
            }
            return updatedProps;
        };

        const saveNewProperty = function saveNewProperty(propertyName) {
            const listItems = modalBody.getElementsByTagName('li');
            let newProperty = {};
            for (let li of listItems) {
                const modalInputFields = li.getElementsByTagName('input');
                const property = modalInputFields[0].value;

                if (property === '') {
                    newProperty = null;
                    break;
                }

                newProperty[property] = Utilities.GetTypedValue(modalInputFields[1].value);
            }
            if (newProperty && listItems.length > 0) {
                newConfig[propertyName].push(newProperty);
                updateUI();
                $('#add-object-modal').modal('hide');
            } else {
                alert('Unable to process the information, please check your input')
            }
        };

        const deleteProperty = function deleteProperty(index, property) {
            delete newConfig[property][index];
            newConfig[property].splice(index, 1);
            updateUI();
        };

        const setupDOMElements = function setupDOMElements() {
            document.addEventListener("DOMContentLoaded", function domContentLoadedEventListener() {
                jsonField = document.getElementById('device-configuration-json');
                modalSaveButton = document.getElementById('btn-save-modal');
                modalBody = document.getElementById('add-new-config-object-body');
                saveChangesButton = document.getElementById('btn-save-changes');
                discardChangesButton = document.getElementById('btn-discard-changes');
                updateUI();
            });
        };

        const updateUI = function updateUI() {
            const originalObject = JSON.stringify(originalConfig);
            const newObject = JSON.stringify(newConfig);
            if (originalObject.localeCompare(newObject) === 0) {
                saveChangesButton.disabled = true;
                discardChangesButton.disabled = true;
            } else {
                saveChangesButton.disabled = false;
                discardChangesButton.disabled = false;
            }
            jsonField.innerHTML = JSON.stringify(newConfig, null, 4);
            DeviceConfigurationUI.CreateSimpleCard('Intervals', 'Intervals', newConfig, updateUI, saveUpdatedProperty);
            DeviceConfigurationUI.CreateObjectCards('IO Controllers', 'IOControllers', newConfig, updateUI, saveUpdatedProperty, deleteProperty);
            DeviceConfigurationUI.CreateObjectCards('Power supplies', 'PowerSupplies', newConfig, updateUI, saveUpdatedProperty, deleteProperty);
            DeviceConfigurationUI.CreateObjectCards('Programs', 'Programs', newConfig, updateUI, saveUpdatedProperty, deleteProperty);
        };

        /**
         * When dismissing the modal, the event listeners remain attached.
         * So need to create new buttons
         * @param propertyName
         */
        const setupModalButtons = function createModalElements(propertyName) {
            const buttons = DeviceConfigurationUI.CreateModalButtons();

            buttons.saveButton.addEventListener('click', function modalSaveButtonEventListener() {
                saveNewProperty(propertyName);
            });
            const buttonFooter = document.getElementById('new-property-modal-footer');
            buttonFooter.innerHTML = '';
            buttonFooter.append(buttons.cancelButton);
            buttonFooter.append(buttons.saveButton);
        };


    })(DeviceConfiguration)
}

module.exports = DeviceConfiguration;