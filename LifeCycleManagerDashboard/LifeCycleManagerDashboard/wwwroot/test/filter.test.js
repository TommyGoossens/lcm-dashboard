const LCMMapFilters = require("../js/mapfilters");
const LCMMapView = require("../js/mapview");

const fs = require('fs');
const path = require('path');
const mockPage = fs.readFileSync(path.resolve('wwwroot/test/mockpages/mapview-page.html'), 'utf8');

describe("Filtering", function mainMapFilterTestSuite() {
    beforeAll(() => {
        document.body.innerHTML = mockPage;
    });
    afterEach(() => {
        document.body.innerHTML = mockPage;
    });
    describe("on status", function statusTestSuite() {
        it("generates HTML code for 2 statuses", function populateStatusTest() {
            const result = LCMMapFilters.populateStatusBoxes(["Disconnected", "Connected"]);
            if (result) {
                var count = (result.match(/<input type="checkbox"/g) || []).length;
                expect(count).toBe(2);
            }
        });
    });
    describe("on province", function provinceTestSuite() {
        it("adds all provinces to the dropdown menu", function populateProvinceTest() {
            var provinces = ["Drenthe", "Flevoland", "Friesland", "Gelderland", "Groningen", "Limburg", "Noord-Brabant", "Noord-Holland", "Overijssel", "Utrecht", "Zeeland", "Zuid-Holland"];
            const result = LCMMapFilters.displayProvinces(provinces);
            if (result) {
                var count = (result.match(/<a/g) || []).length;
                //12 provinces, but one <a>All provinces</a>
                expect(count).toBe(13);
                var numberOfListedProvinces = 0;
                provinces.forEach(province => {
                    if (result.match(`<a class="dropdown-item">${province}</a>`)) {
                        numberOfListedProvinces++;
                    }
                });

                expect(numberOfListedProvinces).toBe(12);
            }
        });
    });

    describe("on project", function projectTestSuite() {
        beforeEach(() => {
            LCMMapFilters.displayProjects(['HI-DataLab']);
        });
        it("adds all projects to the dropdown menu", function populateProjectsTest() {
            const labels = document.getElementById('project-dropdown').getElementsByTagName('label');
            expect(labels.length).toBe(3);
        });

        describe("has event listeners", function eventListenerSuite() {
            let checkboxAllProjects, checkboxDatalab;
            beforeEach(() => {
                checkboxAllProjects = document.getElementById('project-ALL');
                checkboxDatalab = document.getElementById('project-HI-DataLab');
            });
            it("checks all projects when selecting all projects", function allProjectsTest() {
                checkboxAllProjects.checked = false;
                checkboxDatalab.checked = false;
                expect(checkboxDatalab.checked).toBe(false);

                checkboxAllProjects.dispatchEvent(new Event('click'));
                expect(checkboxAllProjects.checked).toBe(true);
                expect(checkboxDatalab.checked).toBe(true);

                checkboxAllProjects.dispatchEvent(new Event('click'));
                expect(checkboxAllProjects.checked).toBe(false);
                expect(checkboxDatalab.checked).toBe(false);
            });

            it("is possible to deselect a filter", function deselectFilterTestCase() {
                checkboxAllProjects.dispatchEvent(new Event('click'));
                expect(checkboxAllProjects.checked).toBe(false);
                expect(checkboxDatalab.checked).toBe(false);
                
                checkboxDatalab.dispatchEvent(new Event('click'));
                expect(checkboxDatalab.checked).toBe(true);
                
                checkboxDatalab.dispatchEvent(new Event('click'));
                expect(checkboxAllProjects.checked).toBe(false);
                expect(checkboxDatalab.checked).toBe(false);
            })
        })
    })
});