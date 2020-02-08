const ProjectList = require("../js/projectlist");
const fs = require('fs');
const path = require('path');
const mockPage = fs.readFileSync(path.resolve('wwwroot/test/mockpages/projectlist-page.html'), 'utf8');

const project1 = {
    projectId: 0,
    name: 'Project 1',
    description: 'Description for project 1',
    contactPerson: {
        name: 'Jan',
        email: 'jan@heijmans.nl',
        phoneNr: '+31612345678'
    }
}
const project2 = {
    projectId: 2,
    name: 'Project 2',
    description: 'Description for project 2',
    contactPerson: {
        name: 'Piet',
        email: 'piet@heijmans.nl',
        phoneNr: '+31612345678'
    }
}
const projects = [project1, project2];
describe('The projectlist file', function mainProjectListTestSuite() {
    beforeAll(() => {
        document.body.innerHTML = mockPage;
    });
    afterEach(() => {
        document.body.innerHTML = mockPage;
    });
    describe("project list", function listTestSuite() {
        beforeEach(() => {
            var projectAnchors = document.getElementById('project-list-items').getElementsByTagName('a');
            expect(projectAnchors.length).toBe(0);
        });

        it("displays 2 anchor tags", function displayAnchorTest() {
            ProjectList.PopulateProjectList(projects);

            projectAnchors = document.getElementById('project-list-items').getElementsByTagName('a');
            expect(projectAnchors.length).toBe(2);
        });

        it('marks the first element as active', function markElementAsActiveTest() {
            ProjectList.PopulateProjectList(projects);

            projectAnchors = document.getElementById('project-list-items').getElementsByTagName('a');
            expect(projectAnchors.length).toBe(2);

            expect(projectAnchors[0].classList.contains('active')).toBe(true);
        });

        it('the UI if no projects are present', function noProjectsTest() {
            ProjectList.PopulateProjectList([]);
            expect(document.getElementById('project-list-items').innerHTML).toBe('No projects found')
        });

        describe("when selecting a project", function selectProjectTestSuite() {
            it("displays the correct information", function correctInformationTest() {
                ProjectList.PopulateProjectList(projects);
                var projectDetails = document.getElementById('project-details').getElementsByTagName('li');
                expect(projectDetails[0].innerHTML).toBe(`Project: ${projects[0].name}`);
                expect(projectDetails[1].innerHTML).toBe(`Contact: ${projects[0].contactPerson.name}`);

                projectAnchors = document.getElementById('project-list-items').getElementsByTagName('a');
                projectAnchors[1].dispatchEvent(new Event('click'));

                projectDetails = document.getElementById('project-details').getElementsByTagName('li');
                expect(projectDetails[0].innerHTML).toBe(`Project: ${projects[1].name}`);
                expect(projectDetails[1].innerHTML).toBe(`Contact: ${projects[1].contactPerson.name}`);
            })
        })
    })

    describe("search box", function searchBoxTestSuite() {
        beforeEach(() => {
            ProjectList.SetProperties("URL", [project1, project2]);
        });

        it('has an Enter key listener', function enterKeyListenerTest() {
            const originalFunc = ProjectList.FilterProjects;
            ProjectList.FilterProjects = jest.fn();

            expect(ProjectList.FilterProjects).not.toBeCalled();
            ProjectList.AddSearchBoxKeyListener();

            document.querySelector('#search-box-projects').dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
            expect(ProjectList.FilterProjects).toBeCalled();

            // Unfortunately mockRestore is not working.
            ProjectList.FilterProjects = originalFunc;
        });

        it('filters the list', function filterListTest() {
            const searchTerm = 'Project 1';
            ProjectList.PopulateProjectList(projects);

            projectAnchors = document.getElementById('project-list-items').getElementsByTagName('a');
            expect(projectAnchors.length).toBe(2);

            ProjectList.AddSearchBoxKeyListener();
            document.getElementById('search-box-projects').value = searchTerm;
            document.querySelector('#search-box-projects').dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));

            projectAnchors = document.getElementById('project-list-items').getElementsByTagName('a');
            expect(projectAnchors.length).toBe(1);

            const result = projectAnchors[0].getElementsByTagName('h5');
            expect(result[0].innerHTML).toBe(searchTerm);
        })
    })
})
