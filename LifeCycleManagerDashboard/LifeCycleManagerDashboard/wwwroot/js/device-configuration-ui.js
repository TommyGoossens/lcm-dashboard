if (!("DeviceConfigurationUI" in window)) {
    const Utilities = require('./../js/utilities');
    DeviceConfigurationUI = {};
    (function main(context) {

        /**
         *  Create input fields for both the property and value.
         *  Used for the modal
         * @param propertyName main property name, used to append the new data to
         * @returns {HTMLLIElement} one 'li' element
         */
        context.createPropertyInputListItem = function createPropertyInputListItem(propertyName) {
            const listItem = document.createElement("li");
            const propertyInput = document.createElement("input");
            const valueInput = document.createElement("input");
            const deleteButton = document.createElement("button");


            propertyInput.type = "text";
            propertyInput.value = propertyName;
            propertyInput.className = "form-control property-input";

            valueInput.type = "text";
            valueInput.className = "form-control value-input";

            deleteButton.innerText = "-";
            deleteButton.className = "delete btn btn-sm btn-danger float-right ml-2";

            listItem.appendChild(propertyInput);
            listItem.appendChild(valueInput);
            listItem.appendChild(deleteButton);
            return listItem;
        };

        /**
         * Create simple card displaying a list of values
         * @param displayName Name to display in the UI
         * @param propertyName JSON property name
         * @param configObject object containing all the existing properties
         * @param updateUICallback callback function to update the UI
         * @param saveUpdatedPropertyCallback callback function to save the updated info
         */
        context.CreateSimpleCard = function CreateSimpleCard(displayName, propertyName, configObject, updateUICallback, saveUpdatedPropertyCallback) {
            const entries = Object.entries(configObject[propertyName]);
            const cardBody = document.getElementById(`card-body-${propertyName}`);
            document.getElementById(`collapse-button-${propertyName}`).innerHTML = `${displayName} ( ${entries.length} )`;
            cardBody.innerHTML = '';

            createListItems(entries).forEach(li => {
                cardBody.append(li);
            });
            const saveBtn = createSaveButton();
            saveBtn.getElementsByTagName('button')[0].addEventListener('click', function simpleCardSaveBtnEventListener() {
                configObject[propertyName] = saveUpdatedPropertyCallback(this);
                updateUICallback();
            });
            cardBody.append(saveBtn);
        };

        /**
         * Create list of cards containing object cards
         * @param displayName Name to display in the UI
         * @param propertyName JSON property name
         * @param configObject object containing all the existing properties
         * @param updateUICallback callback function to update the UI
         * @param saveUpdatedPropertyCallback callback function to save the updated info
         * @param deletePropertyCallback callback function to delete the property
         */
        context.CreateObjectCards = function CreateObjectCards(displayName, propertyName, configObject, updateUICallback, saveUpdatedPropertyCallback, deletePropertyCallback) {
            let entries = Object.entries(configObject[propertyName]);
            document.getElementById(`collapse-button-${propertyName}`).innerHTML = `${displayName} ( ${entries.length} )`;
            const cardBody = document.getElementById(`card-body-${propertyName}`);
            cardBody.innerHTML = '';

            for (const [key, val] of entries) {
                const card = createObjectCard(key, val, propertyName, deletePropertyCallback);
                const saveBtn = createSaveButton();

                saveBtn.getElementsByTagName('button')[0].addEventListener('click', function objectCardSaveBtnEventListener() {
                    configObject[propertyName][key] = saveUpdatedPropertyCallback(this);
                    updateUICallback();
                    document.getElementById(`collapse-${propertyName}-${key}`).classList.add('show');
                });

                card.getElementsByTagName('ul')[0].append(saveBtn);
                cardBody.append(card);
            }
        };

        /**
         * Create the cancel and save buttons for the 'New property' modal
         * @returns buttonsObject containing the cancel and save buttons
         */
        context.CreateModalButtons = function CreateModalButtons() {
            let cancelButton = document.createElement('button');
            let saveButton = document.createElement('button');

            cancelButton.type = "button";
            cancelButton.className = 'btn btn-secondary';
            cancelButton.innerHTML = "Cancel";
            cancelButton.addEventListener('click', function modalCancelBtnEventListener() {
                $('#add-object-modal').modal('hide')
            });

            saveButton.type = "button";
            saveButton.className = 'btn btn-primary';
            saveButton.id = 'btn-save-modal';
            saveButton.innerHTML = "Save changes";

            return {
                cancelButton,
                saveButton
            };
        };

        const createSaveButton = function createSaveButton() {
            const liSaveButton = document.createElement('li');
            liSaveButton.className = "w-100";
            const saveBtn = document.createElement('button');
            saveBtn.type = "button";
            saveBtn.className = "btn btn-sm btn-heijmans-blue float-right";
            saveBtn.innerHTML = "Save";
            liSaveButton.append(saveBtn);
            return liSaveButton;
        };

        const createObjectCard = function createObjectCard(key, val, propertyName, deletePropertyCallback) {
            const cardListItem = document.createElement('li');
            cardListItem.className = "w-100 row";
            const card = document.createElement('div');
            card.className = "card mr-1 object-property-card";

            card.innerHTML = `
            <div class="card-header" >
                    <h5 class="mb-0" >
                        <button class="btn btn-link" data-toggle="collapse" data-target="#collapse-${propertyName}-${key}" aria-expanded="false">
                            Index[${key}]
                        </button>
                    </h5>
            </div>`;

            const propertiesList = document.createElement('ul');
            propertiesList.id = `collapse-${propertyName}-${key}`;
            propertiesList.className = "collapse w-100 card-body";

            const entries = Object.entries(val);
            createListItems(entries).forEach(li => {
                propertiesList.append(li);
            });

            card.append(propertiesList);

            cardListItem.append(card);
            cardListItem.append(createDeletePropertyButton(key, propertyName, deletePropertyCallback));
            return cardListItem;
        };

        const createListItems = function createListItems(values) {
            let result = [];
            for (const [key, value] of values) {
                const li = document.createElement('li');
                li.className = "w-100";
                const inputElement = document.createElement('input');
                switch (Utilities.GetTypeOfValue(value)) {
                    case "string":
                        inputElement.type = 'text';
                        inputElement.classList.add('w-75');
                        break;
                    case "number":
                        inputElement.type = 'number';
                        inputElement.classList.add('w-50');
                        break;
                    case "float":
                        inputElement.type = 'number';
                        inputElement.step = '0.1';
                        inputElement.classList.add('w-50');
                        break;
                    case "boolean":
                        inputElement.type = 'checkbox';
                        inputElement.checked = value;
                        break;
                }
                inputElement.classList.add('float-right');
                inputElement.value = value;
                const pKey = document.createElement('p');
                pKey.innerText = key;
                li.append(pKey);
                li.append(inputElement);
                result.push(li)
            }
            return result;
        };

        const createDeletePropertyButton = function createDeletePropertyButton(key, propertyName, deletePropertyCallback) {
            const deleteBtnDiv = document.createElement('div');
            deleteBtnDiv.className = 'float-right';
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'btn btn-sm btn-danger';
            deleteButton.innerText = '-';
            deleteButton.addEventListener('click', function btnDeletePropertyEventListener() {
                deletePropertyCallback(key, propertyName);
            });
            deleteBtnDiv.append(deleteButton);
            return deleteBtnDiv;
        };
    })(DeviceConfigurationUI)
}

module.exports = DeviceConfigurationUI;