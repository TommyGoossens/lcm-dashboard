const DeviceConfiguration = require('../js/device-configuration');
const fs = require('fs');
const path = require('path');
const mockPage = fs.readFileSync(path.resolve('wwwroot/test/mockpages/device-config-page.html'), 'utf8');

const mockConfig = {
    Intervals: {
        'valueNumber': 1,
        'valueFloat': 1.2
    }, Programs: [
        {
            'valueBool': false,
            'valueString': "I'm a string"
        },
    ], IOControllers: [],
    PowerSupplies: []
};

describe('DeviceConfiguration', function mainDeviceConfigurationTestSuite() {
    beforeEach(() => {
        $.fn.modal = () => {
        };

        document.body.innerHTML = mockPage;
        DeviceConfiguration.SetOriginalConfig(mockConfig);
        window.document.dispatchEvent(new Event("DOMContentLoaded", {
            bubbles: true,
            cancelable: true
        }));
    });
    afterEach(() => {
        delete $.fn.modal;
    });

    describe('creating the modal', function modalCreationTestSuite() {
        beforeEach(() => {
            const entries = Object.keys(mockConfig['Programs'][0]);
            DeviceConfiguration.CreateModal(entries, 'Programs');
        });
        it('uses a template when there is one available', function modalTemplateTestCase() {
            const modalBody = document.getElementById('add-new-config-object-body');
            const templateListItems = modalBody.getElementsByTagName('li');
            const entries = Object.keys(mockConfig['Programs'][0]);
            for (let i = 0; i < entries.length; i++) {
                expect(templateListItems[i].getElementsByTagName('input')[0].value).toBe(entries[i]);
            }
        });
        it('saves the new property', function newPropertyTestSuite() {
            const cardHeader = document.getElementById('collapse-button-Programs');
            expect(cardHeader.innerHTML).toBe('Programs ( 1 )');

            const saveButton = document.getElementById('btn-save-modal');
            saveButton.dispatchEvent(new Event('click'));
            expect(cardHeader.innerHTML).toBe('Programs ( 2 )');
        });

        it('has the option to remove a row', function removeRowTestCase() {
            const btnAddRow = document.getElementById('add-property-row');
            const modalBody = document.getElementById('add-new-config-object-body');
            let listItems = modalBody.getElementsByTagName('li');
            expect(listItems.length).toBe(2);
            btnAddRow.dispatchEvent(new Event('click'));
            expect(listItems.length).toBe(3);
        })
    });

    describe('updating properties', function updatingPropertiesTestSuite() {
        afterEach(() => {
            DeviceConfiguration.DiscardChanges();
        });
        it('updates the property', function updatePropertyTestCase() {
            const cardSimpleValues = document.getElementById('card-body-Intervals');
            const saveButton = cardSimpleValues.getElementsByTagName('button')[0];
            const listItems = cardSimpleValues.getElementsByTagName('li');
            const firstValueInput = listItems[0].getElementsByTagName('input')[0];
            expect(firstValueInput.value).toBe("1");
            firstValueInput.value = 2;
            saveButton.dispatchEvent(new Event('click'));
            expect(firstValueInput.value).toBe("2");
        })

    });
});