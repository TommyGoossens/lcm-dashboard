if (!("ProjectList" in window)) {
    ProjectList = {};
    (function (context) {
        const Http = new XMLHttpRequest();
        const moment = require('moment');
        let backendUrl = '';
        let projects = [];
        let accesstoken = '';
        ///                         ///
        ///     Public methods      ///
        ///                         ///

        /**
         * Sets the URL to the backend and the projects from the view model
         * @param {string} backendUrl - URL to the backend
         * @param {Project[]} projects - The list of projects from the view model
         */
        context.SetProperties = function SetProperties(backendUrl, projects, accesstoken) {
            this.backendUrl = backendUrl;
            this.projects = projects;
            this.accesstoken = accesstoken;
        };

        /**
         * Display the HTML elements containing the project names
         * @param {Project[]} projects - List of projects
         */
        context.PopulateProjectList = function PopulateProjectList(projects) {
            let output = '';
            for (let i = 0; i < projects.length; i++) {
                output += `
                <a href="#"
                    class="list-group-item list-group-item-action flex-column align-items-start" id="${projects[i].projectId}"
                    data-toggle="list" role="tab">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${projects[i].name}</h5>
                        </div>
                </a>`
            }
            // Displays the list of <a> elements
            document.getElementById('project-list-items').innerHTML = output;

            addEventListenersToProjectAnchors(projects);

            if (projects.length > 0) {
                document.getElementById(projects[0].projectId).classList.add('active');
                showProjectDetails(projects[0]);
            } else {
                clearInterface();
            }
        };

        /**
         * Adds a trigger for the 'Enter' button, to trigger the filter
         */
        context.AddSearchBoxKeyListener = function AddSearchBoxKeyListener() {
            document.getElementById('search-box-projects').addEventListener('keyup', function (e) {
                if (e.key == 'Enter') {
                    context.FilterProjects();
                }
            });
        };

        /**
         * Filter the projects based on the input in the search box
         */
        context.FilterProjects = function FilterProjects() {
            const filterTerm = document.getElementById('search-box-projects').value;
            const filteredProjects = this.projects.filter(p => p.name.includes(filterTerm));
            context.PopulateProjectList(filteredProjects);
        };

        ///                         ///
        ///     Private methods     ///
        ///                         ///

        /**
         * Add click events to the <a> elements
         * @param {Project[]} projects - List of projects needed for the correct data
         */
        const addEventListenersToProjectAnchors = function addEventListenersToProjectAnchors(projects) {
            // Retrieves the <a> elements and adds a click event listener to the elements.
            const projectAnchors = document.getElementById('project-list-items').getElementsByTagName('a');
            for (let i = 0; i < projectAnchors.length; i++) {
                projectAnchors[i].addEventListener('click', function (event) {
                    showProjectDetails(getProjectById(this.id, projects))
                })
            }
        };

        /**
         * When there are no projects, clear the UI
         */
        const clearInterface = function clearInterface() {
            document.getElementById('project-details').innerHTML = '';
            document.getElementById('project-description').innerHTML = '';
            document.getElementById('project-list-devices').innerHTML = '';
            document.getElementById('project-list-items').innerHTML = 'No projects found';
        };

        /**
         * Get the project based on id
         * @param {int} id - Requested ID
         * @param {Project[]} projects - List of projects
         */
        const getProjectById = function getProjectById(id, projects) {
            return projects.find(p => p.projectId == id);
        };

        /**
         * Displays the detais of the selected project.
         * @param {Project} project - Project object containing all information
         */
        const showProjectDetails = function ShowProjectDetails(project) {
            GetDevices(project.name);
            document.getElementById('project-details').innerHTML = `<li>Project: ${project.name}</li>
                    <li>Contact: ${project.contactPerson.name}</li>
                    <li>E-mail: <a href="mailto:${project.contactPerson.email}?subject=${project.contactPerson.name}">${project.contactPerson.email}</a></li>
                    <li>Tel.: <a href="tel:${project.contactPerson.phoneNr}"> ${project.contactPerson.phoneNr}</li>`;
            document.getElementById('project-description').innerHTML = project.description;
        };

        /**
         * Retrieves all LifeCycleManager devices for the selected project
         * @param {string} name - Name of the requested project
         */
        const GetDevices = function GetDevices(name) {
            document.getElementById('project-list-devices').innerHTML = 'Fetching devices';
            Http.open('GET', `${context.backendUrl}/api/devices/project/${name}`);
            Http.setRequestHeader('Authorization', `Bearer ${context.accesstoken}`);
            Http.send();

            Http.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    document.getElementById('project-list-devices').innerHTML = ``;
                    const devices = JSON.parse(Http.responseText);
                    if (devices.length === 0) {
                        document.getElementById('project-list-devices').innerHTML = `No devices connected to ${name}`;
                    }

                    for (let i = 0; i < devices.length; i++) {
                        const date = moment(devices[i].lastActivityTime);
                        document.getElementById('project-list-devices').innerHTML +=
                            `<tr class="d-flex">
                                <td class="col-1 text-center"><span class="device-status-circle text-center" style="background-color:red"></span></td>
                                <td class="col-1">${devices[i].applicationState}</td>
                                <td class="col-4">${devices[i].deviceId}</td>
                                <td class="col-2">${devices[i].location}</td>
                                <td class="col-2">${date.format("HH:mm:ss - DD MM Y")}</td>
                                <td class="col-1">${devices[i].firmware}</td>
                                <td class="col-1">
                                    <a class="pr-1" href="#" id="map-${devices[i].deviceId}"><img src="/images/map_icon.png" alt="map" height="30" /></a>
                                    <a href="#" id="info-${devices[i].deviceId}"><img src="/images/info_icon.png" alt="info" height="30" class="mr-1" /></a>
                                </td>
                            </tr>`;

                        document.getElementById(`map-${devices[i].deviceId}`).onclick = function mapClickEvent(e) {
                            directTo.call(this, 'DirectToMap', devices[i].deviceId);
                        };
                        document.getElementById(`info-${devices[i].deviceId}`).onclick = function detailsClickEvent(e) {
                            directTo.call(this, 'DirectToDetails', devices[i].deviceId);
                        }
                    }
                }
            }
        }

        /**
         * Directs the user to the detail page. Url is retrieved by requesting the value from the controller
         * @param {string }destination DirectToMap / DirectToDetails
         * @param {int} deviceId - Id of the selected device
         */
        const directTo = function directTo(destination, deviceId) {
            const url = document.getElementById(destination).value;
            window.location.href = `${url}?deviceId=${deviceId}`;
        };
    })(ProjectList)
}
module.exports = ProjectList;