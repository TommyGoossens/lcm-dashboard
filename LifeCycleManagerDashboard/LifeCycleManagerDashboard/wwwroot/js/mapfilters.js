if (!("LCMMapFilters" in window)) {
    LCMMapFilters = {};
    (function main(context) {
        // Populates the status boxes
        context.populateStatusBoxes = function populateStatusBoxes(statuses) {
            let output = "";
            if (statuses) {
                statuses.forEach(key => {
                    output +=
                        `
                <div class="custom-control custom-checkbox col-6">
                    <input type="checkbox" class="custom-control-input" id="lcm-${key}" checked onclick="LCMMapView.FilterFlagType(this,'${key}');">
                    <label class="custom-control-label" for="lcm-${key}">${key}</label>
                </div>`;
                });
            }
            document.getElementById('statusCheckboxes').innerHTML = output;
        };

        // Populates the province list with provinces
        context.displayProvinces = function displayProvinces(provinces) {
            let output = 'No provinces';
            if (provinces) {
                output =
                    `
                            <li>
                                <label>
                                    <input type="checkbox" value="ALL" id="province-ALL" checked/>All provinces
                                </label>
                            </li>
                            <li class="dropdown-divider"></li>
                    `;
                provinces.forEach(key => {
                    output += `
                                <li>
                                    <label>
                                        <input type="checkbox" value="${key}" id="project-${key}" checked/>${key}
                                    </label>
                                </li>`;
                });
            }
            provinces.push("");
            document.getElementById('province-dropdown').innerHTML = output;
            addEventListeners(provinces, 'province');
        };

        // Populates the project lists and attaches event listeners
        context.displayProjects = function displayProjects(projects) {
            let output = 'No projects';
            if (projects) {
                output = `
                            <li>
                                <label>
                                    <input type="checkbox" value="ALL" id="project-ALL" checked/>All projects
                                </label>
                            </li>
                            <li class="dropdown-divider"></li>
                            <li>
                                <label>
                                    <input type="checkbox" value="" id="project-UNCATEGORIZED" checked/> Uncategorized
                                </label>
                            </li>
                            <li class="dropdown-divider"></li>`;

                projects.forEach(key => {
                    output += `
                                <li>
                                    <label>
                                        <input type="checkbox" value="${key}" id="project-${key}" checked/>${key}
                                    </label>
                                </li>`
                });
            }

            projects.push("");
            document.getElementById('project-dropdown').innerHTML = output;
            addEventListeners(projects, 'project');
        };

        const addEventListeners = function (unfilteredList, prefix) {
            let filteredItems = [...unfilteredList];
            const projectDropdown = document.getElementById(`${prefix}-dropdown`);

            projectDropdown.addEventListener('change', function (event) {
                //Get the value of the event
                const selectedItem = event.target.defaultValue;
                if (selectedItem === "ALL") {
                    if (event.target.checked) {
                        filteredItems = [...unfilteredList];
                        setStateCheckboxes(true, prefix);
                    } else {
                        setStateCheckboxes(false, prefix);
                        filteredItems = [];
                    }
                } else {
                    if (filteredItems.includes(selectedItem)) {
                        const index = filteredItems.findIndex(p => p === selectedItem);
                        filteredItems.splice(index, 1);
                    } else {
                        filteredItems.push(selectedItem);
                    }
                }
                LCMMapView.FilterDevices(filteredItems, prefix);
                document.getElementById(`${prefix}-ALL`).checked = (filteredItems.length === unfilteredList.length);
            });

            preventDropdownFromDisappearing();
        };

        // Adds a click event listener, to stop the propagation. This prevents the dropdown from disappearing
        const preventDropdownFromDisappearing = function preventDropdownFromDisappearing() {
            let elements = document.getElementsByClassName('allow-focus');
            for (let i = 0; i < elements.length; i++) {
                elements[i].addEventListener('click', function (event) {
                    event.stopPropagation();
                });
            }
        };

        // Set the state of all checkboxes
        const setStateCheckboxes = function setStateCheckboxes(stateBoolean, prefix) {
            const checkboxes = document.getElementById(`${prefix}-dropdown`).getElementsByTagName('input');
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = stateBoolean;
            }
        }
    })(LCMMapFilters);
}

module.exports = LCMMapFilters;