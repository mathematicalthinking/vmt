const { each, capitalize } = require('lodash');

const fixtures = require('../fixtures/community');

const { rooms, templates, courses } = fixtures;
describe('test community search and filter', function() {
  function checkUrl(privacy, roomType, query, resourceType) {
    // @TODO The community link shows 'activities' in the URL rather than 'templates'. This must be fixed in the codebase.
    const adjustedResourceType =
      resourceType === 'templates' ? 'activities' : resourceType;
    let expectedUrl = `community/${adjustedResourceType}?privacy=${privacy}`;

    if (adjustedResourceType !== 'courses') {
      expectedUrl += `&roomType=${roomType}`;
    }

    if (query) {
      expectedUrl += `&search=${query}`;
    }
    cy.url().should('include', expectedUrl);
  }

  function checkItemsOrder(expectedItems) {
    if (expectedItems.length === 0) {
      const msg = "There doesn't appear to be anything here yet";
      cy.getTestElement('box-list').should('contain', msg);
    } else {
      cy.getTestElement('box-list')
        .children()
        .each(($child, ix) => {
          const expectedName = expectedItems[ix].name;
          cy.wrap($child).should('contain', expectedName);
        });
    }
  }
  function checkItemsLength(expectedLength) {
    cy.getTestElement('box-list')
      .children()
      .should('have.length', expectedLength);
  }

  function doSearch(query, options = {}) {
    const { doClear } = options;
    const input = cy.getTestElement('community-search');

    if (doClear) {
      input.clear();
    }

    input.type(query);
  }
  function clickFilter(testId) {
    return cy.getTestElement(testId).click();
  }

  function clickResourceTab(resourceType) {
    const capped = capitalize(resourceType);
    cy.getTestElement('resource-tabs').within(() => {
      cy.contains(capped).click();
    });
  }

  before(function() {
    cy.task('restoreAll');
    cy.visit('/');
    cy.contains('Community').click();
  });

  const configs = {
    all: {
      description: 'Initial Settings',
      setup: {
        filtersToSelect: ['all-roomType-filter', 'all-privacy-filter'],
        searchBar: {
          query: '',
          doClear: true,
        },
      },
      urlParams: {
        privacy: 'all',
        roomType: 'all',
        search: '',
      },
      expectedItems: {
        rooms: rooms.all,
        courses: courses.all,
        templates: templates.all,
      },
    },
    allGgb: {
      description: 'All Geogebra',
      setup: {
        filtersToSelect: ['all-privacy-filter', 'geogebra-filter'],
        searchBar: {
          query: '',
          doClear: true,
        },
      },
      urlParams: {
        privacy: 'all',
        roomType: 'geogebra',
        search: '',
      },
      expectedItems: {
        rooms: rooms.allGgb,
        templates: templates.allGgb,
      },
    },
    allDesmos: {
      description: 'All Desmos',
      setup: {
        filtersToSelect: ['all-privacy-filter', 'desmos-filter'],
        searchBar: {
          query: '',
          doClear: true,
        },
      },
      urlParams: {
        privacy: 'all',
        roomType: 'desmos',
        search: '',
      },
      expectedItems: {
        rooms: rooms.allDesmos,
        templates: templates.allDesmos,
      },
    },
    publicAll: {
      description: 'All Public Rooms',
      setup: {
        filtersToSelect: ['public-filter', 'all-roomType-filter'],
        searchBar: {
          query: '',
          doClear: true,
        },
      },
      urlParams: {
        privacy: 'public',
        roomType: 'all',
        search: '',
      },
      expectedItems: {
        rooms: rooms.publicAll,
        courses: courses.publicAll,
        templates: templates.publicAll,
      },
    },
    privateAll: {
      description: 'All Private Rooms',
      setup: {
        filtersToSelect: ['private-filter', 'all-roomType-filter'],
        searchBar: {
          query: '',
          doClear: true,
        },
      },
      urlParams: {
        privacy: 'private',
        roomType: 'all',
        search: '',
      },
      expectedItems: {
        rooms: rooms.privateAll,
        courses: courses.privateAll,
        templates: templates.privateAll,
      },
    },
    publicGgb: {
      description: 'Public Geogebra Rooms',
      setup: {
        filtersToSelect: ['public-filter', 'geogebra-filter'],
        searchBar: {
          query: '',
          doClear: true,
        },
      },
      urlParams: {
        privacy: 'public',
        roomType: 'geogebra',
        search: '',
      },
      expectedItems: {
        rooms: rooms.publicGgb,
        templates: templates.publicGgb,
      },
    },
    publicDesmos: {
      description: 'Public Desmos Rooms',
      setup: {
        filtersToSelect: ['public-filter', 'desmos-filter'],
        searchBar: {
          query: '',
          doClear: true,
        },
      },
      urlParams: {
        privacy: 'public',
        roomType: 'desmos',
        search: '',
      },
      expectedItems: {
        rooms: rooms.publicDesmos,
        templates: templates.publicDesmos,
      },
    },
    privateDesmos: {
      description: 'Private Desmos Rooms',
      setup: {
        filtersToSelect: ['private-filter', 'desmos-filter'],
        searchBar: {
          query: '',
          doClear: true,
        },
      },
      urlParams: {
        privacy: 'private',
        roomType: 'desmos',
        search: '',
      },
      expectedItems: {
        rooms: rooms.privateDesmos,
        templates: templates.privateDesmos,
      },
    },
  };

  describe('Filtering and Sorting Rooms', function() {
    return Object.values(configs).map((config) => {
      const { description, setup, urlParams, expectedItems } = config;
      const { privacy, roomType, search: searchParam } = urlParams;
      const { filtersToSelect, searchBar } = setup;

      const { query, doClear } = searchBar;

      each(expectedItems, (resources, resourceType) => {
        return describe(`${description} ${capitalize(
          resourceType
        )}`, function() {
          before(function() {
            clickResourceTab(resourceType);
            filtersToSelect.forEach((testId) => {
              const doSkip =
                resourceType === 'courses' &&
                [
                  'geogebra-filter',
                  'desmos-filter',
                  'all-roomType-filter',
                ].includes(testId);
              if (!doSkip) {
                clickFilter(testId);
              }
            });
            if (query) {
              doSearch(query, { doClear });
            }
            checkUrl(privacy, roomType, searchParam, resourceType);
          });

          it(`should display ${resources.length} items`, function() {
            checkItemsLength(resources.length);
          });

          it('should display items in correct order', function() {
            checkItemsOrder(resources);
          });
        });
      });
      return true;
    });
    // const expectedItems = fixtures.allLatest.allLatest;
    // console.log('expectedItems', expectedItems);
    // it('privacy should be set to all', function() {
    //   cy.get('@privacyAll').should('be.checked');
    // });
    // it('roomType should be set to all', function() {
    //   cy.get('@roomTypeAll').should('be.checked');
    // });

    // it(`should display ${expectedItems.length} items`, function() {
    //   checkItemsLength(expectedItems.length);
    // });

    // it('should display items in correct order', function() {
    //   checkItemsOrder(expectedItems);
    // });

    // checkItems('blah', expectedItems);
  });

  // xdescribe('All Geogebra', function() {
  //   const expectedItems = fixtures.allLatest.allLatestGgb;
  //   before(function() {
  //     cy.get('@geogebra').click();
  //     checkUrl('all', 'geogebra');
  //   });

  //   it(`should display ${expectedItems.length} items`, function() {
  //     checkItemsLength(expectedItems.length);
  //   });

  //   it('should display items in correct order', function() {
  //     checkItemsOrder(expectedItems);
  //   });
  // });

  describe('Searching', function() {
    it('searches for a single room', function() {
      clickResourceTab('rooms');
      checkItemsLength(rooms.all.length);
      doSearch('reference');
      cy.url().should(
        'include',
        'community/rooms?privacy=all&roomType=all&search=reference'
      );
      checkItemsLength(1);
      cy.contains('reference room').should('exist');
    });

    it('Changing resource tab should clear search text', function() {
      clickResourceTab('templates');
      cy.getTestElement('community-search').should('have.value', '');
      clickResourceTab('rooms');
    });

    // @TODO This test CORRECTLY fails; the search box does not get clear. Something to fix in the codebase.
    it('Clicking community tab should clear search text', function() {
      doSearch('reference');
      cy.getTestElement('community-search').should('have.value', 'reference');
      cy.wait(1000); // give the UI some time to do the search and display results
      cy.getTestElement('nav-Community').click({ force: true });
      cy.getTestElement('community-search').should('have.value', '');
    });

    // @todo test that we can search by description or instructions
    it('searches by description', function() {
      cy.getTestElement('community-search')
        .clear()
        .type('reference tool');
      cy.url().should(
        'include',
        'community/rooms?privacy=all&roomType=all&search=reference%20tool'
      );
      cy.getTestElement('box-list')
        .children()
        .should('have.length', 1);
    });

    // @todo add tests for course and activities
  });
});
