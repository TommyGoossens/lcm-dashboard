const DeviceConfigurationUI = require('../js/device-configuration-ui');
const fs = require('fs');
const path = require('path');
const mockPage = fs.readFileSync(path.resolve('wwwroot/test/mockpages/device-config-page.html'), 'utf8');

//Mock functions for the event listeners
let mockUpdateUICallback, mockSaveUpdatedPropertyCallback, mockDeletePropertyCallback;

const mockConfig = {
    Intervals: {
        'valueNumber': 1,
        'valueFloat': 1.2,
        'valueBool': false,
        'valueString': "I'm a string"
    }, Programs: [
        {
            'valueNumber': 1,
            'valueFloat': 1.2,
            'valueBool': false,
            'valueString': "I'm a string"
        },
    ], IOControllers: [],
    PowerSupplies: []
};

describe('DeviceConfigurationUI', function mainDeviceConfigurationUITestSuite() {
    beforeEach(() => {
        document.body.innerHTML = mockPage;
        mockUpdateUICallback = jest.fn();
        mockSaveUpdatedPropertyCallback = jest.fn();
        mockDeletePropertyCallback = jest.fn();

    });
    afterEach(() => {
        document.body.innerHTML = mockPage;
        mockUpdateUICallback.mockReset();
        mockSaveUpdatedPropertyCallback.mockReset();
        mockDeletePropertyCallback.mockReset();

    });
    it('creates a property input list item', function createPropertyInputListItemTestCase() {
        const testPropertyName = 'propertyName';
        const listItem = DeviceConfigurationUI.createPropertyInputListItem(testPropertyName);
        const inputFields = listItem.getElementsByTagName('input');
        expect(inputFields.length).toBe(2);
        expect(inputFields[0].value).toBe(testPropertyName);
        const deleteButton = listItem.getElementsByTagName('button');
        expect(deleteButton.length).toBe(1);
    });

    describe('when creating a simple card', function simpleCardTestSuite() {
        beforeEach(() => {
            const displayName = "Simple values", propertyName = "Intervals";
            DeviceConfigurationUI.CreateSimpleCard(displayName, propertyName, mockConfig, mockUpdateUICallback, mockSaveUpdatedPropertyCallback);
        });
        it('succeeds in doing so', function simpleCardCreationSuccess() {
            const cardBody = document.getElementById('card-body-Intervals');
            const cardHeader = document.getElementById('collapse-button-Intervals');
            expect(cardHeader.innerHTML).toBe('Simple values ( 4 )');
            const listItems = cardBody.getElementsByTagName('li');
            // fifth element is the save button
            expect(listItems.length).toBe(5);
        });
        it('adds one save button with a event listener', function saveEventListenerTestCase() {
            const cardBody = document.getElementById('card-body-Intervals');
            const saveButton = cardBody.getElementsByTagName('button')[0];

            saveButton.dispatchEvent(new Event('click'));
            expect(mockUpdateUICallback).toHaveBeenCalledTimes(1);
            expect(mockSaveUpdatedPropertyCallback).toHaveBeenCalledTimes(1);
        });
    });

    describe('when creating a object card', function objectCardTestSuite() {
        beforeEach(() => {
            const displayName = "Object values", propertyName = "Programs";
            DeviceConfigurationUI.CreateObjectCards(displayName, propertyName, mockConfig, mockUpdateUICallback, mockSaveUpdatedPropertyCallback, mockDeletePropertyCallback);

        });
        it('succeeds in doing so', function objectCardCreationSuccess() {
            const cardBody = document.getElementById('card-body-Programs');
            const cardHeader = document.getElementById('collapse-button-Programs');
            expect(cardHeader.innerHTML).toBe('Object values ( 1 )');
        });

        it('adds one delete button with a event listener', function saveEventListenerTestCase() {
            const cardBody = document.getElementById('card-body-Programs');
            const objectListItems = cardBody.getElementsByTagName('li');
            const firstObject = objectListItems[0];
            const deleteButton = firstObject.getElementsByTagName('button')[2];
            deleteButton.dispatchEvent(new Event('click'));
            expect(mockDeletePropertyCallback).toHaveBeenCalledTimes(1);
        });

        it('adds one save button with a event listener', function saveEventListenerTestCase() {
            const cardBody = document.getElementById('card-body-Programs');
            const objectPropertiesBody = cardBody.getElementsByTagName('ul')[0];

            const firstObject = cardBody.getElementsByTagName('li')[0];
            const saveButton = firstObject.getElementsByTagName('button')[1];
            saveButton.dispatchEvent(new Event('click'));
            expect(mockUpdateUICallback).toHaveBeenCalledTimes(1);
            expect(mockSaveUpdatedPropertyCallback).toHaveBeenCalledTimes(1);
            expect(objectPropertiesBody.className).toEqual(expect.stringContaining('show'));
        });
    });

    it('creates buttons for the modal', function createModalButtonsTestCase() {
        const buttons = DeviceConfigurationUI.CreateModalButtons();
        expect(Object.keys(buttons).length).toBe(2);
        expect(buttons.cancelButton.innerHTML).toBe('Cancel');
        expect(buttons.saveButton.innerHTML).toBe('Save changes');
    })
});