// JavaScript for the WSP Tool Library and the WSP Sketch Viewer. There's enough common code
// to justify putting these together.
/* global GSP, UTILMENU, $, PAGENUM, WIDGETS, PREF, FileReader, Image */
/* eslint-disable */
/* eslint "semi": [2, "always"], "one-var": ["warn", "consecutive"] */
var TOOLS = (function() {
  const allTools = [];
  var collectionList = [],
    $resize; // The resize control in the tool library window
  // To extend resizing to the viewer, we'll need each sketch to maintain a pointer
  // to its own resize control.
  let nextSketchDivID = 1,
    dragResizing, // true if the user is dragging the resize control
    debugMode;

  PREF.setWebPagePrefs([
    { category: 'util', value: true },
    { name: 'resetbutton', value: ['all'] },
  ]);
  /* I've regularized the handling of collections of tools in the tool library. Original code used php to find the directory
   * of tool json files and load whatever files it found. But that solution suffered from a CORS issue and broke with later
   * release of php, So now there's a new system in place using specifically-named text files to indicate what tools are where.
   * The home directory for the Tool Library has a text file named collections.txt. Here's an example of its content, which
   * has one line per connection, providing the descriptive name of the collection and the subdirectory of tools/library
   * in which the tools are stored.
   *   Basic: basic
   *   Hyperbolic Geometry: hyperbolic
   * This library has two collections, the "Basic" collection in tools/library/basic,
   * and the "Hyperbolic Geometry" collection in tools/library/hypeerbolic.
   * Each collection consists of a set of json WSP files, together with a text file
   * named toolList.txt that has one line per tool giving the tool's file name.
   * For instance, here are the first two lines of toolList.txt for the Basic collection:
   *   01 Point, Compass, Straightedge Tools.json
   *   02 Parallel and Perpendicular Tools.json
   * As another improvement, when a collection is loaded a button is added, above the tool display,
   * to bring that collection into the library. The button is named for the collection, so
   * in our example the two buttons are named "Basic" and "Hyperbolic Geometry".
   *
   * As we load the tools into the Library's tool repository, we have some potential race conditions to allow for
   * if we're to attend to putting the tools in the consistent order dictated by toolList.txt.
   * The return time for the ajax calls will be erratic due to variations in filesize and network speed
   * and latency, so we create an ordered list (loadedFiles) to store the json data as it comes in,
   * keeping this list in the order dictated by toolList.txt. As data arrives, we delay inserting one json's
   * tools its turn arrives, when the preceding list elements have been processed. There's also a delay
   * associated with each tool from a given json, in retrieving the various images and inserting them into
   * the html page. To allow following list items to begin their work, when an item's json data is ready
   * to be processed, we immediately check the tool count for this item and reserve the needed html elements
   * before actually proessing the data. As soon as we've reserved space for the current item's tools,
   * the following item can begin its work as well.
   * The sequence of states for each json file is "waiting, hasData, addingNodes, loaded"
   * To keep the tools in order on the html page, they must be in order as they add their nodes,
   * so once a tool is in the hasData state, it must not add nodes until the preceding tool has added its nodes.
   * */
  function addToolToTable(tool, firstTool, lastTool) {
    const table = $('#toolTable');
    let img;
    const toolIndex = allTools.length;
    const content =
      '<div class="toolItem" onclick="TOOLS.insertToolInSketch (' +
      "'libSketch'," +
      toolIndex +
      ');"></div>';
    const cell = $.parseHTML(content);
    table.append(cell);
    if (tool.image) {
      img = new Image();
      img.src = tool.image.src;
      $(cell).append(img);
    } else {
      $(cell).append('<br>' + tool.metadata.name);
    }
    if (firstTool) {
      $(cell).addClass('firstToolItem');
    }
    if (lastTool) {
      $(cell).addClass('lastToolItem');
    }
    allTools.push(tool);
  }

  function _getEnv() {
    if (window.location.href.includes('VMT')) {
      return '/WSPAssets/library/';
    } else return './';
  }

  function loadToolCollection(dirName, filesToProcess) {
    // Each loadedFiles object has its fileName and a data property,
    // whose state transitions from "waiting" to actual data, and then to "done"
    var toolDir = _getEnv() + dirName + '/',
      finishedIx = -1,
      numFiles = filesToProcess.length,
      processing = false,
      loadedFiles = []; // track loaded files to install them in order.

    // Add the nodes for this file's tools
    function addDataToTable(data) {
      const last = data.tools.length - 1;
      data.tools.forEach(function(tool, index) {
        const img = tool.metadata.image;
        if (typeof img !== 'undefined') {
          tool.image = data.resources.pictures[img];
        }
        addToolToTable(tool, index === 0, index === last);
      });
    }

    function processData() {
      // Check the queue to find tools with data that are ready to add nodes
      // Use processing flag to allow only one copy of this function to run at a time.
      var ix, aFile, state;
      if (processing) {
        return; // Only a single instance of this function at a time.
      }
      processing = true;
      ix = finishedIx + 1;
      while (ix < numFiles && processing) {
        // loop until we find a file with data or a file that's still waiting
        aFile = loadedFiles[ix];
        state = aFile.state;
        if (state === 'waiting') {
          // The ix file doesn't yet have data, so we're done.
          processing = false;
          return; // We hit a queued file with no data yet. Allow a subsequent call to finish the job
        }
        // console.log('Processing file #' + (ix +1));
        if (state === 'hasData') {
          // ok to load this json
          aFile.state = 'addingNodes'; //signal that this data is being added
          addDataToTable(aFile.data);
          aFile.state = 'loaded';
        }
        if (ix > finishedIx) {
          finishedIx = ix;
        }
        ix += 1;
      }
    }

    function callAjax(ix) {
      $.ajax({
        url: toolDir + loadedFiles[ix].fName,
        success: function(data) {
          // console.log('Loaded file #' + (ix + 1) + ': ' + loadedFiles[ix].fName);
          loadedFiles[ix].data = data;
          loadedFiles[ix].state = 'hasData';
          processData(); // install these tools only if previous tools are already in place
        },
        error: function(data) {
          console.log(data);
        },
      });
    }

    // Body of loadToolCollection
    $.each(filesToProcess, function(ix) {
      // all files are initially waiting
      loadedFiles.push({ fName: this, data: undefined, state: 'waiting' });
      callAjax(ix);
    });
  }

  function loadTools(dirName) {
    // Load the tools from a directory specified.
    // Each collection's directory must contain a toolList.txt file providing the filenames.
    // Once the directory is loaded, its file names are cached in a queue, and loadOneTool is called
    // to process the queue one file at a time. Would it be OK to call .getJSON for multiple files without worrying
    // about the order in which the success() functions are processed? There's likely little harm in doing one file at a time.
    $('#toolTable').empty();
    $.ajax({
      url: _getEnv() + dirName + '/toolList.txt',
      success: function(data) {
        var fileList = data.split('\n');
        loadToolCollection(dirName, fileList);
      },
    });
  }

  function makeCollectionButtons() {
    collectionList.forEach(function(key) {
      var content = '<button type="button" ';
      content +=
        'onclick="TOOLS.loadLibraryTools(\'' +
        key.dir +
        '\');">' +
        key.name +
        '</button>&nbsp';
      $('.uLibButtons').append(content);
    });
  }

  function getCollections(loadDefault) {
    // Find the list of collections in collections.txt, and then load the first collection, which is the default.
    // Each line is of the form "name: dir" where "name" is the name of the collection and "dir" is
    // the directory where the tool files are found.
    // Returns an array of collections, with each collection as an object of the form {name: 'Basic', dir: 'basic'}
    // The name should be used to identify the collection to the user, and dir provides the actual directory.
    $.ajax({
      url: _getEnv() + 'collections.txt',
      success: function(data) {
        var temp = data.split('\n');
        // Turn each line of temp into a key/value pair in the collectionList
        temp.forEach(function(line) {
          var st = line.split(':'),
            name = st[0].trim(),
            dir = st[1].trim();
          collectionList.push({ name: name, dir: dir });
        });
        if (loadDefault) {
          loadTools(collectionList[0].dir);
        }
        makeCollectionButtons();
      },
    });
  }

  function insertTool(selector, index) {
    // insert at end
    const theTool = allTools[index],
      $canvas = $(selector),
      doc = $canvas.data('document'),
      docWidth = doc.docSpec.metadata.width,
      docHeight = doc.docSpec.metadata.height,
      $mainRowNode = $('.wsp-main-row', $canvas);

    if (!doc.tools) {
      doc.tools = [];
      doc.docSpec.tools = [];
    }
    if (theTool.image) {
      if (!doc.resources) {
        doc.resources = {};
        doc.docSpec.resources = {};
      }
      if (!doc.resources.pictures) {
        doc.resources.pictures = [];
        doc.docSpec.resources.pictures = [];
      }
      theTool.metadata.image = doc.resources.pictures.length;
      doc.resources.pictures.push(theTool.image);
      doc.docSpec.resources.pictures.push(theTool.image);
    }
    doc.docSpec.tools.push(theTool);
    doc.addTools([theTool]); // recreate the tool from the spec
    // Delete and re-attach all the tools, since there's no API to add a single tool.
    doc.attachToolsToNode(
      $mainRowNode,
      docWidth,
      docHeight,
      true /* shows undoRedo */
    );
    doc.event(
      'ToolAdded',
      { document: doc },
      { tool: { name: theTool.metadata.name }, index: doc.tools.length - 1 }
    );
    setResizePosition($canvas);
    populateTools(doc);
  }

  /*
 *  The page data and session data (undo history) contain cycles. For instance, the sketch
 *  document contains references to the gobjects of the sketch, which in turn have references
 *  to the sketch. Similarly, a gobj has pointers to its children, which in turn have pointers
 *  back to the parent. There is no simple way of making a deep copy of such a structure,
 *  so we use Crockford's cycle/decycle functions to do the job.
 *
    cycle.js
    2021-05-31
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    This code should be minified before deployment.
    See https://www.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

  // The file uses the WeakMap feature of ES6.

  /* jslint eval */

  /* property
    $ref, decycle, forEach, get, indexOf, isArray, keys, length, push,
    retrocycle, set, stringify, test
*/

  if (typeof JSON.decycle !== 'function') {
    JSON.decycle = function decycle(object, replacer) {
      'use strict';

      // Make a deep copy of an object or array, assuring that there is at most
      // one instance of each object or array in the resulting structure. The
      // duplicate references (which might be forming cycles) are replaced with
      // an object of the form

      //      {"$ref": PATH}

      // where the PATH is a JSONPath string that locates the first occurance.

      // So,

      //      var a = [];
      //      a[0] = a;
      //      return JSON.stringify(JSON.decycle(a));

      // produces the string '[{"$ref":"$"}]'.

      // If a replacer function is provided, then it will be called for each value.
      // A replacer function receives a value and returns a replacement value.

      // JSONPath is used to locate the unique object. $ indicates the top level of
      // the object or array. [NUMBER] or [STRING] indicates a child element or
      // property.

      const objects = new WeakMap(); // object to path mappings

      return (function derez(value, path) {
        // The derez function recurses through the object, producing the deep copy.

        let oldPath; // The path of an earlier occurance of value
        let nu; // The new object or array

        // If a replacer function was provided, then call it to get a replacement value.

        if (replacer !== undefined) {
          value = replacer(value);
        }

        // typeof null === "object", so go on if this value is really an object but not
        // one of the weird builtin objects.

        if (
          typeof value === 'object' &&
          value !== null &&
          !(value instanceof Boolean) &&
          !(value instanceof Date) &&
          !(value instanceof Number) &&
          !(value instanceof RegExp) &&
          !(value instanceof String)
        ) {
          // If the value is an object or array, look to see if we have already
          // encountered it. If so, return a {"$ref":PATH} object. This uses an
          // ES6 WeakMap.

          oldPath = objects.get(value);
          if (oldPath !== undefined) {
            return { $ref: oldPath };
          }

          // Otherwise, accumulate the unique value and its path.

          objects.set(value, path);

          // If it is an array, replicate the array.

          if (Array.isArray(value)) {
            nu = [];
            value.forEach(function(element, i) {
              nu[i] = derez(element, path + '[' + i + ']');
            });
          } else {
            // If it is an object, replicate the object.

            nu = {};
            Object.keys(value).forEach(function(name) {
              nu[name] = derez(
                value[name],
                path + '[' + JSON.stringify(name) + ']'
              );
            });
          }
          return nu;
        }
        return value;
      })(object, '$');
    };
  }

  if (typeof JSON.retrocycle !== 'function') {
    JSON.retrocycle = function retrocycle($) {
      'use strict';

      // Restore an object that was reduced by decycle. Members whose values are
      // objects of the form
      //      {$ref: PATH}
      // are replaced with references to the value found by the PATH. This will
      // restore cycles. The object will be mutated.

      // The eval function is used to locate the values described by a PATH. The
      // root object is kept in a $ variable. A regular expression is used to
      // assure that the PATH is extremely well formed. The regexp contains nested
      // * quantifiers. That has been known to have extremely bad performance
      // problems on some browsers for very long strings. A PATH is expected to be
      // reasonably short. A PATH is allowed to belong to a very restricted subset of
      // Goessner's JSONPath.

      // So,
      //      var s = '[{"$ref":"$"}]';
      //      return JSON.retrocycle(JSON.parse(s));
      // produces an array containing a single element which is the array itself.

      const px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;

      (function rez(value) {
        // The rez function walks recursively through the object looking for $ref
        // properties. When it finds one that has a value that is a path, then it
        // replaces the $ref object with a reference to the value that is found by
        // the path.

        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            value.forEach(function(element, i) {
              if (typeof element === 'object' && element !== null) {
                const path = element.$ref;
                if (typeof path === 'string' && px.test(path)) {
                  value[i] = eval(path);
                } else {
                  rez(element);
                }
              }
            });
          } else {
            Object.keys(value).forEach(function(name) {
              const item = value[name];
              if (typeof item === 'object' && item !== null) {
                const path = item.$ref;
                if (typeof path === 'string' && px.test(path)) {
                  value[name] = eval(path);
                } else {
                  rez(item);
                }
              }
            });
          }
        }
      })($);
      return $;
    };
  }

  /* When a page is inserted, removed, or re-ordered, the array sketch.poges (which correspond to the page ID)
   * must be adjusted.
   **/
  function adjustPageNumbers(sketch, doc, pageNum) {
    // adjust page #s, starting with pageNum
    // pageNum is the page # of the page inserted or deleted
    let ix, newID;
    const sketchPages = sketch.pages; // zero-based, so index is 0 for page #1
    for (ix = pageNum - 1; ix < sketch.pages.length; ix++) {
      newID = (ix + 1).toString();
      if (sketchPages[ix].metadata.title === sketchPages[ix].metadata.id) {
        sketchPages[ix].metadata.title = newID; // change the title only if title matches id
      }
      sketchPages[ix].metadata.id = newID;
    }
    PAGENUM.setToolEnabling(doc); // Sync the page_toggle styles of the tool buttons to agree with the changed prefs
  }

  function getCanvas(selector) {
    // selector is a string identifying the id of the sketch_canvas,
    // a DOM node within the same sketch_container as the sketch_canvas
    // or a jQuery selector of a button or command in the same sketch_container as the sketch_canvas
    // Returns the jQuery object for the sketch_canvas node.
    let $canvas;
    if (selector.anchorNode) {
      // is this a sketch_canvas DOM node?
      $canvas = $(selector.anchorNode); // sketch
    } else if (selector instanceof Element) {
      // some other DOM node; find the canvas in the same container
      $canvas = $(selector); // use this later to find the actual sketch_canvas
    } else if (typeof selector === 'string') {
      // either a jQuery selector or a sketch_canvas id
      $canvas = $(selector);
      if (!$canvas.length) {
        //jQuery couldn't find it
        $canvas = $('#' + selector); // is the selector a sketch id?
      }
    }
    if (!$canvas.length) {
      console.log('TOOLS.getCanvas found no results: ', selector);
      return;
    } else {
      // we have a result...
      if ($canvas.length > 1) {
        console.log('TOOLS.getCanvas found multiple result: ', $canvas);
        $canvas = $($canvas[0]); // use the first result
      }
      // $canvas may still be a node in the same sketch_container, so find the actual canvas
      $canvas = $canvas.closest('.sketch_container').find('.sketch_canvas');
      if (!$canvas.hasClass('sketch_canvas')) {
        console.log('TOOLS.getCanvas failed for selector: ', selector);
        return;
      }
    }
    return $canvas;
  }

  function getSketch(selector) {
    if (selector.anchorNode) {
      return selector;
    } else {
      return getCanvas(selector).data('document').focusPage;
    }
  }

  /* To delete a page, we need to:
   * Remove the page from
   * We don't need to touch sketch.metadata, resources, or tools.
   * In doc.docspec.pages[n-1] we need to push a new item with {metadata: {...}, preferences: {...}}
   * In doc.pageData.n.spec we need to push the same item
   * In doc.pageData we need {n: {session: {delta: {}. history: {}}, empty for new and populated for clone
   **/

  function deletePage(selector) {
    // selector may be the id of a sketch_canvas or may be a New Page or Clone Page button beneath a sketch,
    // or may be a Utility Menu command
    const canvas = getCanvas(selector),
      doc = canvas.data('document'),
      theSketchJSON = doc.sQuery().getSketchJSON(), // already stringified
      sketch = JSON.parse(theSketchJSON), // the copy of the sketch in which we will make our changes
      numPages = sketch.pages.length,
      pageNum = +doc.focusPage.metadata.id, // the number of the page to be deleted
      newPageNum = pageNum < numPages ? pageNum : pageNum - 1, // The new page to switch to after deleting
      $pageButtons = $(canvas)
        .parent()
        .find('.page_buttons');

    function userConfirm() {
      // show confirmation dialog here
      return true;
    }

    function removePageData() {
      // the keys of doc.pageData are the page id's. The contents must be closed up.
      let ix, newID, meta;
      const pageData = doc.pageData;
      for (ix = pageNum; ix < sketch.pages.length; ix++) {
        // Move each page after the removed page forward one slot
        pageData[ix] = pageData[ix + 1]; // Now both ix + 1 and ix point to the same sketch -- but not for long...
        newID = ix.toString();
        meta = pageData[ix].spec.metadata;
        if (meta.title === meta.id) {
          // The new title matches the id ONLY if the original title matched its id
          meta.title = newID;
        }
        meta.id = newID;
      }
      delete pageData[sketch.pages.length];
    }

    function updatePrefs() {
      // docSpec.metatdata.authorPreferences stores arrays of page numbers. Update them...
      let list;
      const prefs = doc.docSpec.metadata.authorPreferences; // the master copy of prefs
      if (!prefs) return; // some docs don't have prefs
      Object.keys(prefs).forEach(function(item, key) {
        // Object.keys iterates only over ownProperties
        let listPos;
        if (typeof item === 'string' && item.match(/^\d+(,\d+)*$/)) {
          // Every element >= pageNum should be decremented
          list = item.split(',');
          list.forEach(function(val, i, arr) {
            arr[i] = +arr[i];
          }); // avoid issues of string/number conversion
          listPos = list.indexOf(pageNum);
          if (listPos >= 0) {
            list.splice(listPos, 1); // remove pageNum from the list, if present
          }
          list.forEach(function(val, ix, arr) {
            // move every value after pageNum up by 1
            if (val > pageNum) {
              arr[ix] = val - 1;
            }
          });
          prefs[key] = list.join(',');
        }
      });
      // The working copy is in doc.metatdata.authorPreferences. Update it as well.
      doc.metadata.authorPreferences = JSON.parse(JSON.stringify(prefs));
    }

    if (numPages === 1 || !userConfirm()) return false;
    WIDGETS.showWidgets(false); // close any active widget
    if (numPages < 2) {
      $pageButtons.removeClass('page_buttonsActive');
    }
    // Switch to the next page, or to the prev page if this is the last page
    doc.switchPage(pageNum < numPages ? pageNum + 1 : pageNum - 1, true);
    doc.docSpec.pages.splice(pageNum - 1, 1); // remove deleted page from docSpec.pages[]
    removePageData();
    updatePrefs();
    sketch.pages.splice(pageNum - 1, 1);
    adjustPageNumbers(sketch, doc, pageNum, 'delete');
    doc.switchPage(newPageNum, true); // This is now a no-op, but changes the displayed page #.
  }

  /* To create a new page, we to push the actual page data into sketch.pages[]
   * We don't need to touch sketch resources or tools.
   * In doc.docspec.pages[n-1] we need to push a new item with {metadata: {...}, preferences: {...}}
   * In doc.pageData.n.spec we need to push the same item
   * In doc.pageData we need {n: {session: {delta: {}. history: {}}, empty for new and populated for clone
   **/

  function insertPage(selector, option) {
    // option === "new" or option === "clone"
    // selector may be the id of a sketch_canvas or may be a New Page or Clone Page button beneath a sketch,
    // or may be a Utility Menu command
    const $canvas = getCanvas(selector),
      doc = $canvas.data('document'),
      theSketchJSON = doc.sQuery().getSketchJSON(), // already stringified
      sketch = JSON.parse(theSketchJSON), // the copy of the sketch in which we will make our changes
      curPageNum = doc.focusPage.metadata.id,
      newPageNum = (+curPageNum + 1).toString(),
      newPage = JSON.parse(JSON.stringify(sketch.pages[curPageNum - 1])), // copy the current page's sketch.pages data
      rect = newPage.metadata.sketchRect,
      $pageButtons = $canvas.parent().find('.page_buttons');

    function insertPageData(pageNum, data) {
      // the keys of doc.pageData are the page id's. The contents all have to be moved to make space for the new data
      // At the same time, adjust the docSpec authorPrefs for any prefs that are based on page numbers.
      let ix, newID, meta;
      const pageData = doc.pageData;
      for (ix = sketch.pages.length; ix > pageNum; ix--) {
        // Move each page after the inserted page back one slot
        // No need to stringify and parse, because each page only ends up in a single slot
        pageData[ix] = pageData[ix - 1]; // Now both ix - 1 and ix point to the same sketch -- but not for long...
        newID = ix.toString();
        meta = pageData[ix].spec.metadata;
        if (meta.title === meta.id) {
          // The new title matches the id ONLY if the original title matched its id
          meta.title = newID;
        }
        meta.id = newID;
      }
      pageData[pageNum] = data;
    }

    function updatePrefs() {
      // docSpec.metatdata.authorPreferences stores arrays of page numbers. Update them...
      // The working copy is in doc.metatdata.authorPreferences. As it's a copy, update it as well.
      const prefs = doc.docSpec.metadata.authorPreferences; // the master copy of prefs
      if (!prefs) return; // some docs don't have prefs
      Object.keys(prefs).forEach(function(item, key) {
        // Object.keys iterates only over ownProperties
        let list;
        if (typeof item === 'string' && item.match(/^\d+(,\d+)*$/)) {
          // Every element >= newPageNum should be incremented
          list = item.split(',');
          list.forEach(function(val, i, arr) {
            arr[i] = +arr[i];
          }); // avoid issues of string/number conversion
          for (let jx = list.length - 1; list[jx] >= newPageNum - 1; jx--) {
            if (list[jx] >= newPageNum) {
              list[jx] = list[jx] + 1;
            } else if (list[jx] === +curPageNum) {
              // copy curPageNum settings for the new page
              list.splice(jx + 1, 0, +newPageNum);
            }
          }
          prefs[key] = list.join(',');
        }
      });
      doc.metadata.authorPreferences = JSON.parse(JSON.stringify(prefs));
    }

    function copySessionData() {
      // copy session data from original page
      const oldSession = doc.pageData[curPageNum].session;
      let newSession;
      doc.recordActivePageDelta(); // record delta for old page
      doc.resetSession(newPageNum); // create empty session (with history prototype) for new page
      if (option === 'clone') {
        newSession = doc.pageData[newPageNum].session;
        newSession.history.current = JSON.retrocycle(
          JSON.decycle(oldSession.history.current)
        );
        newSession.delta = JSON.retrocycle(JSON.decycle(oldSession.delta));
      }
    }

    WIDGETS.showWidgets(false); // close any active widget
    if (option === 'new') {
      rect.bottom += -rect.top;
      rect.right += -rect.left;
      rect.top = 0;
      rect.left = 0;
      newPage.objects = {};
    }
    sketch.pages.splice(newPageNum - 1, 0, newPage);
    const newPageData = JSON.retrocycle(JSON.decycle(doc.pageData[curPageNum]));
    newPageData.spec.metadata.id = newPageNum;
    if (option === 'new') {
      newPageData.spec.objects = {};
    }
    newPageData.spec.metadata.title = newPageNum;
    doc.docSpec.pages.splice(newPageNum - 1, 0, newPageData.spec);
    insertPageData(newPageNum, newPageData);
    updatePrefs();
    adjustPageNumbers(sketch, doc, newPageNum, 'insert');
    // Delay inserting newPageData until after the subsequent entries in doc.pageData have been moved back
    copySessionData(); // cloned page should maintain original page's history
    doc.switchPage(newPageNum, true);
    $pageButtons.addClass('page_buttonsActive');
  }

  function forceRedraw(sketch) {
    sketch.constraintFrame++;
    sketch.dirtyRect = GSP.Geom.kInfiniteRect;
    sketch.isDirty = true;
    sketch.setNeedsDisplay();
    // sketch.constrainAndRedraw();
  }

  function resetWindowSize(selector) {
    const $sketchNode = $(selector),
      doc = $sketchNode.data('document'),
      baseNode = $sketchNode.find('.wsp-base-node')[0],
      toolWidth = $sketchNode.find('.wsp-tool-container').css('width') || 0,
      dpRatio = window.devicePixelRatio,
      $canvases = $('.wsp-clip-node', baseNode).find('canvas'),
      newWidth = +$('#width')[0].value;
    let newHeight = +$('#height')[0].value,
      fullWidth = newWidth + parseInt(toolWidth);

    function fixSketchRect(target) {
      const rect = target.sketchRect;
      rect.bottom = rect.top + newHeight;
      rect.right = rect.left + newWidth;
    }

    function fixToolContainer(height, width) {
      // Here we fix up the height of the tool-container to be full height and to show a scroll bar if needed.
      const column = $sketchNode.find('.wsp-tool-column')[0],
        $buttonArea = $sketchNode.parent().find('.button_area');
      let fixedHeight = 0,
        toolsHeight = 0;
      $('.wsp-fixed-tool', column)
        .filter(':visible')
        .each(function() {
          fixedHeight += $(this).outerHeight() || 0;
        });
      $('.wsp-tool', column)
        .filter(':visible')
        .each(function() {
          toolsHeight += $(this).outerHeight() || 0;
        });
      $('.wsp-tool-column', $sketchNode).outerHeight(height);
      $('.wsp-user-tools', $sketchNode).outerHeight(height - fixedHeight);
      if (fixedHeight + toolsHeight > height) {
        $('.wsp-user-tools', $sketchNode).addClass('wsp-tool-overflow-y');
      } else {
        $('.wsp-user-tools', $sketchNode).removeClass('wsp-tool-overflow-y');
      }
      $sketchNode.parent().find('button_area');
      $buttonArea.css('max-width', $(column).width() + width);
    }

    doc.metadata.height = newHeight;
    doc.metadata.width = newWidth;
    $sketchNode.width(fullWidth);
    $.each(doc.pageData, function(key, value) {
      fixSketchRect(value.spec.metadata);
    });
    fixSketchRect(doc.focusPage.metadata);
    doc.docSpec.metadata.height = newHeight;
    doc.docSpec.metadata.width = newWidth;
    $('.wsp-clip-node', baseNode).css({ width: newWidth, height: newHeight });
    $canvases.each(function() {
      // Set new size and scale for each canvas, without changing the scale.
      const ctx = this.getContext('2d'),
        trans = ctx.getTransform(); // cache the current transform
      // this.width = newWidth;
      // this.height = newHeight;
      $(this).css({ width: newWidth, height: newHeight });
      this.width = Math.round(newWidth * dpRatio);
      this.height = Math.round(newHeight * dpRatio);
      ctx.setTransform(trans); // restore the cached transform
    });

    // Adjust the sizes of the tranform divs. cf. code in document.js attachToNode()
    $('.wsp-transform-large', baseNode).css({
      width: fullWidth,
      height: newHeight,
    });
    $('.wsp-transform-medium', baseNode).css({
      width: fullWidth * 0.75,
      height: newHeight * 0.75,
    });
    $('.wsp-transform-small', baseNode).css({
      width: fullWidth * 0.5,
      height: newHeight * 0.5,
    });
    if ($('.wsp-transform-medium', baseNode).css('display') !== 'none') {
      fullWidth *= 0.75;
      newHeight *= 0.75;
    } else if ($('.wsp-transform-small', baseNode).css('display') !== 'none') {
      fullWidth *= 0.5;
      newHeight *= 0.5;
    }
    $('.wsp-transform-node', baseNode).css({
      width: fullWidth,
      height: newHeight,
    });
    $(baseNode).css({ width: fullWidth, height: newHeight });

    setResizePosition($sketchNode);
    fixToolContainer(newHeight, newWidth);
    forceRedraw(doc.sQuery.sketch);
  }

  function setResizePosition($sketchNode) {
    const $clipNode = $sketchNode.find('.wsp-clip-node'),
      clipOffset = $sketchNode.find('.wsp-clip-node').offset(),
      $container = $sketchNode.parent(),
      containerOffset = $container.offset(),
      x = clipOffset.left + $clipNode.width() - $resize.width(),
      y = clipOffset.top + $clipNode.height() - $resize.height() - 1;
    $container.css({ width: x - containerOffset.left + $resize.width() + 2 }); // Add 2 pixels for right border
    $resize.css({ top: y, left: x });
  }

  function cloneSketch(index) {
    function uniqueName(seed) {
      let trial, nodes;

      function check() {
        return $(this).text() === trial;
      }

      let i = 0;
      const $test = $('#uSketchList li');
      seed = seed.replace(/-\d+/, '');
      seed = seed + '-';
      do {
        i += 1;
        trial = seed + i;
        nodes = $test.filter(check);
      } while (nodes.length > 0);
      return trial;
    }

    const $canvasNode = $($('.sketch_canvas')[index]);
    const doc = $canvasNode.data('document');
    const theSketchJSON = doc.sQuery().getSketchJSON(); // already stringified
    const theName = uniqueName($canvasNode.data('fileName'));
    addSketchToPage(theName, theSketchJSON);
  }

  function dragToolCallback(dragIndex, target) {
    const $canvas = $('#libSketch'),
      doc = $canvas.data('document'),
      targetIndex = $(target).data('index'),
      specTemp = doc.docSpec.tools.splice(dragIndex, 1), // Remove this element from the tools array
      docTemp = doc.tools.splice(dragIndex, 1),
      $tools = $('.wsp-tool', $canvas),
      $temp = $($tools[dragIndex]).detach();
    if ($(target).hasClass('uTrashIcon')) {
      doc.event(
        'ToolRemoved',
        { document: doc },
        { tool: { name: docTemp[0].metadata.name }, index: dragIndex }
      );
    } else {
      // Move the dragged tool, instead of deleting
      doc.docSpec.tools.splice(targetIndex, 0, specTemp[0]);
      doc.tools.splice(targetIndex, 0, docTemp[0]);
      if (targetIndex < dragIndex) {
        // dragging up
        $temp.insertBefore($tools[targetIndex]);
      } else {
        // dragging down
        $temp.insertAfter($tools[targetIndex]);
      }
      doc.event(
        'ToolMoved',
        { document: doc },
        {
          tool: { name: docTemp[0].metadata.name },
          oldIndex: dragIndex,
          newIndex: targetIndex,
        }
      );
    }
    populateTools(doc);
  }

  function dragSketchCallback(dragIndex, target) {
    // the dragged item has been dropped on a target
    let allTargets, $dragNode, targetIndex;
    if (target.id === 'clone') {
      cloneSketch(dragIndex);
    } else if (target.id === 'trash') {
      $($('.sketch_container')[dragIndex]).remove();
    } else {
      // handle an actual move
      $dragNode = $($('.sketch_container')[dragIndex]).detach();
      allTargets = $('.sketch_container');
      targetIndex = $(target).data('index');
      if (targetIndex < allTargets.length) {
        $dragNode.insertBefore($('.sketch_container')[targetIndex]);
      } else {
        $dragNode.insertAfter($('.sketch_container')[targetIndex - 1]);
      }
    }
    repopulateSketchControl();
  }

  // This draggable list call works for a draggable list whose elements have draggable=true.
  // Each item on the list must have a jQuery data element "index" storing the item's index in the list.
  // The list items can be dragged up or down in the list, and each time an element is dropped
  // the dropCallback (dragIndex, targetElement) function is called with parameters indicating
  // which list element (dragIndex) was dropped on which other list element (targetElement).
  // If the list has an item with id="trash" the trashCallback is called when an item is dragged to it.
  // The class uOutline is added to any list item when a dragged item is over it.
  // The standard callback is called with two parameters: the drag index and the drop index.
  // ENHANCEMENT: eliminate the dragging global by making it a data item on the list.
  // Need two custom callbacks, for clone and trash. How to configure these?
  function initDraggableList(dragListID, dropCallback) {
    const $dragNode = $('#' + dragListID);

    function checkTarget(event) {
      let retNode = event.target;
      if (retNode.nodeName === '#text') {
        retNode = retNode.parentNode;
      }
      if (retNode.parentNode.id === dragListID) {
        return retNode;
      } else {
        return null;
      }
    }

    document.addEventListener('dragstart', function(event) {
      const dragIndex = $(event.target).data('index');
      $dragNode.data('dragIndex', dragIndex);
      event.dataTransfer.setData('text/html', dragIndex);
      event.dataTransfer.effectAllowed = 'move';
    });

    document.addEventListener('dragover', function(event) {
      const target = checkTarget(event);
      event.preventDefault();
      if (target) {
        $(target).addClass('uOutline');
      }
    });

    document.addEventListener('dragleave', function(event) {
      const target = checkTarget(event);
      event.preventDefault();
      if (target) {
        $(target).removeClass('uOutline');
      }
    });

    document.addEventListener('drop', function(event) {
      const dragIndex = $dragNode.data('dragIndex'),
        target = checkTarget(event);
      let targetIndex;
      event.preventDefault();
      if (target) {
        targetIndex = $(event.target).data('index');
        $(target).removeClass('uOutline');
        if (targetIndex !== dragIndex) {
          dropCallback(dragIndex, target);
        }
      }
    });
  }

  function initSketchList(listID) {
    initDraggableList(listID, dragSketchCallback);
    WIDGETS.showWidgets(false);
  }

  function initToolList(listID) {
    initDraggableList(listID, dragToolCallback);
    $('#libSketch').on('DidChangeCurrentPage.WSP', checkTools);
  }

  function setToolPref(toolName, $tool, add) {
    // Set the sketch's pref for the named pref on the current page.
    // If add is truthy, insert the page; otherwise remove it.
    const doc = $('#libSketch').data('document'),
      sketch = doc.focusPage,
      pageNum = sketch.metadata.id,
      prefs = doc.metadata.authorPreferences,
      specPrefs = doc.docSpec.metadata.authorPreferences,
      prefName = toolName + 'tool',
      sketchPages = Object.keys(doc.pageData);
    let prefArr = doc.getAuthorPreference(prefName); // returns an array, defaulting to ["all"]
    const idx = prefArr.indexOf(pageNum);

    function allPages() {
      // create an array with all page #'s
      const retVal = [];
      for (let ix = 0; ix < sketchPages.length; ix++) {
        retVal.push(sketchPages[ix]);
      }
      return retVal;
    }

    function setPref(arr) {
      // sets the passed value for prefName in both doc and docSpec prefs
      const prefString = arr.join();
      prefs[prefName] = prefString;
      specPrefs[prefName] = prefString;
      doc.event(
        'ToolPagesChanged',
        { document: doc },
        { tool: { name: docTemp[0].metadata.name }, activePages: prefString }
      );
    }

    if (!prefArr || prefArr[0] === 'all') {
      // doesn't yet exist, so initialize to all or leave empty
      prefArr = allPages();
    } else if (prefArr[0] === 'none') {
      prefArr = [];
    }
    if (add && idx < 0) {
      // the tool isn't enabled for the current page, so add it
      prefArr.push(pageNum);
      prefArr.sort();
    } else if (!add && idx >= 0) {
      // the tool is enabled for current page, so remove it
      prefArr.splice(idx, 1);
    }
    if (prefArr.length === sketchPages.length) {
      // Use "all" so the pref applies to future newly added pages
      setPref(['all']);
    } else if (prefArr.length === 0) {
      setPref(['none']);
    } else {
      setPref(prefArr);
    }
    // Use PAGENUM.setToolEnabling() to set the required css styles.
    PAGENUM.setToolEnabling(doc); // Set css styles to match the changed prefs
  }

  function handleToolCheck(ev) {
    const $btn = $(ev.target),
      toolIndex = $btn.parent().data('index'),
      $tool = $('.wsp-tool', '#libSketch').eq(toolIndex);
    console.log(ev);
    setToolPref(ev.target.id, $tool, $btn[0].checked);
  }

  function checkTools(sketchDoc, context) {
    // Check or uncheck the tool checkboxes for the current page
    // Can be called directly with a sketchDoc or from a DidChangeCurrentPage event
    // In the former (direct) case, context is undefined.
    // In the latter (event) case, context.document is actually the sketch doc.
    const $list = $('#uToolList');
    let index = 0;
    if (context) {
      sketchDoc = context.document;
    }
    if (sketchDoc.tools) {
      $.each(sketchDoc.tools, function(i, val) {
        const prefName = val.metadata.name.toLowerCase().replace(/\s+/g, ''),
          checked = PREF.shouldEnableForCurrentPage(
            'tool',
            prefName,
            sketchDoc.focusPage
          ),
          $el = $list.children().eq(index),
          $box = $('input', $el);
        $box.prop('checked', checked);
        index++;
      });
      $('.toolCheck').off('change');
      $('.toolCheck').change(handleToolCheck);
    }
  }

  function populateTools(sketchDoc) {
    const $list = $('#uToolList');
    $list.empty();
    if (sketchDoc.tools) {
      $.each(sketchDoc.tools, function(i, val) {
        const name = val.metadata.name,
          prefName = name.toLowerCase().replace(/\s+/g, ''),
          //content = '<li draggable="true" class = "toolCheck"><input type="checkbox" id=' +
          //            prefName + '>' + name + '</li>';
          content =
            '<li draggable="true"><input type="checkbox" class = "toolCheck"' +
            ' id = "' +
            prefName +
            '"><span style="float:right;">⇵</span><label for="' +
            prefName +
            '">' +
            name +
            '</label></li>';
        $list.append(content);
        $list
          .children()
          .last()
          .data('index', i);
      });
      $('.toolCheck').change(handleToolCheck);
    }
    if ($list.length) {
      $list.append('<li class="uTrashIcon"></li>');
      checkTools(sketchDoc);
    }
  }

  function initLib(listID) {
    const $node = $('#libSketch'),
      $nameNode = $('#libFileName'),
      $width = $('#width'),
      $height = $('#height');

    function updateSketchName(name) {
      if (name) {
        if (name.indexOf('.') > 0) {
          // remove extension if any
          name = name.substring(0, name.lastIndexOf('.'));
        }
        $nameNode.text(name);
        $('#utilPrompt').css('display', 'none');
        $nameNode.css('display', 'inline-block');
      }
    }

    function checkQuery(prop) {
      const params = {};
      let st = window.location.href.slice(
        window.location.href.indexOf('?') + 1
      );
      const endIndex = st.indexOf('#');
      if (endIndex >= 0) {
        st = st.slice(0, endIndex);
      }
      const search = decodeURIComponent(st);
      const definitions = search.split('&');
      definitions.forEach(function(val) {
        const parts = val.split('=', 2);
        params[parts[0]] = parts[1];
      });
      if (prop && prop in params) {
        return params[prop] || prop;
      } else if (!prop) {
        return params;
      }
      // return undefined if prop is passed but does not exist as a param
    }

    function populatePrefs() {
      const doc = $('#libSketch').data('document'),
        prefs = doc.metadata.authorPreferences;
      $('#uPrefList').empty();
      Object.keys(prefs).forEach(function(item, key) {
        // Object.keys iterates only over ownProperties
        const st = '<li>' + key + ': &nbsp; ' + prefs[key] + '</li>';
        $('#uPrefList').append(st);
      });
    }

    $resize = $('#resize');
    /*
     * Code based on https://javascript.info/mouse-drag-and-drop, and then adapted
     * to work on mobile devices
     */
    const resizer = $resize[0];
    resizer.addEventListener('touchstart', function(e) {
      e.preventDefault();
      startResize(e, true);
    });

    resizer.addEventListener('mousedown', startResize);

    function startResize(e, isTouch) {
      const origSize = { width: +$width.val(), height: +$height.val() },
        origLoc = { x: e.pageX, y: e.pageY },
        shiftX = e.clientX - resizer.getBoundingClientRect().left,
        shiftY = e.clientY - resizer.getBoundingClientRect().top;
      let wait = false; // throttle the mouse movement events

      // moves the resizer to (pageX, pageY) coordinates
      // taking initial shifts into account
      function moveTo(pageX, pageY) {
        const width = Math.max(100, origSize.width + pageX - origLoc.x),
          height = Math.max(100, origSize.height + pageY - origLoc.y);
        if (wait) return; // don't handle this event if one has just occurred
        wait = true;
        setTimeout(function() {
          wait = false;
        }, 50); // don't handle another for 50 ms.
        if (width !== +$width.val() || height !== +$height.val()) {
          resizer.style.left = pageX - shiftX + 'px';
          resizer.style.top = pageY - shiftY + 'px';
          $width.val(width.toString());
          $height.val(height.toString());
          resetWindowSize('#libSketch');
        }
      }

      function onResizeMove(e) {
        if (isTouch) e.preventDefault();
        moveTo(e.pageX, e.pageY);
      }

      function onResizeEnd(e) {
        dragResizing = false;
        if (isTouch) {
          e.preventDefault();
          document.removeEventListener('touchmove', onResizeMove);
          document.removeEventListener('touchend', onResizeEnd);
        } else {
          document.removeEventListener('mousemove', onResizeMove);
          document.removeEventListener('mouseup', onResizeEnd);
        }
        setResizePosition($node);
      }

      dragResizing = true;
      resizer.style.position = 'absolute';
      resizer.style.zIndex = 1000;
      document.body.append(resizer);
      moveTo(e.pageX, e.pageY);

      // move the resizer on touchmove
      if (isTouch) {
        document.addEventListener('touchmove', onResizeMove);
        document.addEventListener('touchend', onResizeEnd);
      } else {
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeEnd);
      }
    }

    function checkLoadFromUrl() {
      // If there's a sketch-url query string, use that sketch
      const urlToLoad = checkQuery('sketch-url');
      if (urlToLoad) {
        $node.data('url', urlToLoad);
        // loadFromUrl (urlToLoad, $node);
      }
    }

    resizer.ondragstart = function() {
      return false;
    };

    function setupDebug() {
      const $prefBtn = $('#uPrefToggle'),
        $prefDiv = $('#uPrefDiv');

      function togglePrefs() {
        // Show the prefs,but hide them again the next time the mouse goes down.
        if ($prefDiv.css('display') === 'none') {
          populatePrefs();
          $(window).one('mousedown', function() {
            $prefDiv.hide();
          });
        }
        $prefDiv.toggle();
      }

      $prefBtn.off('click'); // don't create multiple handlers.
      $prefBtn.click(togglePrefs);
    }

    // Body of initLib
    $node.on('LoadDocument.WSP', function(event, context) {
      const doc = context.document,
        fName = $node.data('fileName');
      $height.val(doc.metadata.height);
      $width.val(doc.metadata.width);
      populateTools(doc);
      updateSketchName(fName);
      if (debugMode) {
        setupDebug();
      }
      setResizePosition($node);
    });
    $node.on('DownloadDocument.WSP', function(event, context, attributes) {
      updateSketchName(attributes.fileName);
    });
    //    $('.util-menu-btn').on ("click", function () {
    //      $('#util-fname').on ("change", function () {
    //        var fName = $('#util-fname')[0].value;
    //        updateSketchName (fName);
    //      });
    //    });
    if (checkQuery('debug')) {
      $('.debug').css('display', 'block');
      debugMode = true;
    }
    if (checkQuery('author')) {
      PREF.setWebPagePrefs([
        { category: 'widget', value: ['all'] },
        { name: 'disablescrolling', value: false },
      ]);
    }
    checkLoadFromUrl();
    initToolList(listID);
    getCollections(true); // true param causes the first collection to be loaded.
  } // initLib

  function scrollToSketch(listItem) {
    const index = $(listItem).data('index');
    const canvasNode = $('.sketch_canvas')[index];
    $([document.documentElement, document.body]).animate(
      {
        scrollTop: $(canvasNode).offset().top,
      },
      1000
    );
  }

  function repopulateSketchControl() {
    const list = $('#uSketchList');
    const sketches = $('.sketch_canvas');
    list.empty();
    $.each(sketches, function(index, node) {
      const name = $(node).data('fileName');
      if (typeof name === 'undefined') {
        return;
      }
      const content =
        '<li draggable="true" onclick="TOOLS.scrollToSketch(this);">' +
        $(node).data('fileName') +
        '</li>';
      const el = list.append(content);
      $(el[0].lastChild).data('index', index);
    });
    list.append('<li id = "clone" class="uCloneItem"> Clone</li>');
    list.append('<li class="uTrashIcon"></li>');
  }

  function addSketchToPage(fName, jsonData) {
    const id = 'sketchDiv' + nextSketchDivID,
      $el = $(
        '<div class="sketch_container">' +
          '<div class="sketch_canvas" id="' +
          id +
          '" data-url="empty.json"></div>' +
          '<div style="clear:both">' +
          '<div class="util-menu-btn"></div>' +
          '<span class="page_buttons"></span>' +
          '<button class="widget_button" onclick="WIDGETS.toggleWidgets(this);">Widgets</button>' +
          '<p class="fileName"></p>' +
          '<input type="button" class="newPageButton" value="New Page" onclick="TOOLS.insertPage(this, \'new\');"/>' +
          '<input type="button" class="newPageButton" value="Clone Page" onclick="TOOLS.insertPage(this, \'clone\');"/>' +
          '</div> </div>'
      );
    var $canvasNode;
    nextSketchDivID += 1;
    $el.find('.fileName')[0].innerHTML = fName.replace('.json', '');
    $('#sketches').append($el);
    $canvasNode = $('#' + id);
    UTILMENU.initUtils(); // set up onLoad handler for the new sketch_canvas
    PAGENUM.initPageControls();
    $canvasNode.data('fileName', fName.replace('.json', ''));
    $canvasNode.data('sourceDocument', jsonData);
    $canvasNode.WSP('loadSketch');
    $canvasNode.removeData('sourceDocument'); // Once the data's loaded, it's no longer needed here
    $canvasNode.on('LoadDocument.WSP', function() {
      const $el = $(this)
        .parent()
        .find('.fileName');
      if ($el && $el.length > 0) {
        $el[0].innerHTML = $(this).data('fileName');
      }
      repopulateSketchControl();
    });
    repopulateSketchControl();
  }

  function doLoadMultiple(files) {
    $.each(files, function() {
      const reader = new FileReader();
      reader.fileName = this.name;
      reader.onload = function() {
        addSketchToPage(this.fileName, this.result);
      };
      reader.readAsText(this);
    });
  }

  function loadSketches() {
    const fileInput = $('#file-name-input');
    fileInput.attr('multiple', '');
    fileInput.attr('onchange', 'TOOLS.loadMultipleSketches(files);');
    fileInput.click();
    fileInput.removeAttr('multiple');
  }

  function checkGraph(selector, mode) {
    // selector is either a sketch or the id of a sketch_canvas
    const sketch = getSketch(selector),
      gobjects = sketch.gobjList.gobjects,
      verbose = mode && mode.match(/verbose/i),
      showTopo = mode && mode.match(/topolog/i),
      cycleGobjs = [],
      topoConflicts = [],
      topoData = [],
      errorStyle = 'color: red; font-weight:bold; font-size:larger;';
    let graphOK = true;

    function checkParent(gobj, parent) {
      // make sure gobj is really a child of this parent
      if (parent.children.indexOf(gobj) < 0) {
        console.log(
          '%cCould not find ' + gobj.id + ' as a child of ' + parent.id,
          errorStyle
        );
        graphOK = false;
      }
    }

    function checkChild(gobj, child) {
      // make sure gobj is really a parent of this child
      if (!child.parentsList || child.parentsList.indexOf(gobj) < 0) {
        console.log(
          '%cCould not find ' + gobj.id + ' as a parent of ' + child.id,
          errorStyle
        );
        graphOK = false;
      }
    }

    function checkTransParent(gobj, parent) {
      // make sure gobj is really a transChild of this parent
      if (!parent.transChildren || parent.transChildren.indexOf(gobj) < 0) {
        console.log(
          '%cCould not find ' + gobj.id + ' as a transChild of ' + parent.id,
          errorStyle
        );
        graphOK = false;
      }
    }

    function checkTransChild(gobj, child) {
      // make sure gobj is really a transParent of this child
      if (!child.transParent || child.transParent !== gobj) {
        console.log(
          '%cCould not find ' + gobj.id + ' as a transParent of ' + child.id,
          errorStyle
        );
        graphOK = false;
      }
    }

    function checkRole(gobj, key, parent) {
      if (gobj.parentsList.indexOf(parent) < 0) {
        console.log(
          '%cParent ' +
            key +
            ': ' +
            parent.id +
            ' missing from parentsList of ' +
            gobj.id,
          errorStyle
        );
        console.error(
          'Parent ',
          key,
          ': ',
          parent.id,
          ' missing from parentsList of ',
          gobj.id
        );
        graphOK = false;
      }
    }

    function checkCycle(startGobj, gobj) {
      let retVal = cycleGobjs.length > 0,
        topoError;
      // Return true if startGobj is a child of gobj. Otherwise search all children of gobj
      // During recursion, verify that the topoligicalIndex of the child is greater than the parent
      $.each(gobj.children, function(index, child) {
        if (gobj.topologicalIndex > child.topologicalIndex) {
          topoError =
            'TOPOLOGY MIS-ORDERED: {#' +
            gobj.id +
            ' ' +
            gobj.kind +
            (gobj.label ? ' "' + gobj.label + '"' : '');
          topoError +=
            ' is T' + gobj.topologicalIndex + '} > {#' + child.id + ' ';
          topoError +=
            child.kind +
            (child.label ? ' "' + child.label + '"' : '') +
            ' is T' +
            child.topologicalIndex +
            '}';
          if (topoConflicts.indexOf(topoError) < 0) {
            console.log('%c' + topoError, errorStyle);
            topoConflicts.push(topoError);
          }
        }
        if (!retVal && child === startGobj) {
          retVal = true; // No need to go deeper
          cycleGobjs.unshift(child.id);
        }
        if (!retVal) {
          // Check this child's descendants
          retVal = checkCycle(startGobj, child); // continue checking children only if no cycle yet
        }
      });
      if (retVal) {
        cycleGobjs.unshift(gobj); // push this gobj and its parents in the recursion
      }
      return retVal;
    }

    function checkConstraintListOrder() {
      let ok = true,
        curVal;
      $.each(sketch.gobjList.constraintList, function(key, gobj) {
        if (!curVal || gobj.topologicalIndex > curVal) {
          curVal = gobj.topologicalIndex;
        } else {
          ok = false;
          return false;
        }
      });
      if (!ok) {
        console.log(
          'Constraint List is not in topological order; this is not necessarily an error.'
        );
      }
    }

    if (verbose) console.log('\nSKETCH GRAPH');
    $.each(gobjects, function(key, gobj) {
      let parentList = '',
        roleList = '      ',
        childList = '',
        transParentList,
        transChildList = '',
        nParents = 0,
        nChildren = 0,
        nTransChildren = 0,
        label = '#' + gobj.id + ' ' + gobj.kind,
        labelStyle = '';
      if (gobj.label) {
        label += ' %c' + gobj.label;
        labelStyle = 'color: green; font-weight: 700;';
      }
      if (verbose)
        console.log(
          label,
          labelStyle,
          'T' + gobj.topologicalIndex,
          gobj.constraint,
          gobj
        );
      $.each(gobj.parentsList, function(index, par) {
        nParents += 1;
        parentList += ' #' + par.id;
        checkParent(gobj, par);
      });
      if (nParents) {
        $.each(gobj.parents, function(key, par) {
          roleList +=
            '(' +
            key +
            ': ' +
            par.kind +
            (par.label ? ' "' + par.label + '"' : '') +
            ' #' +
            par.id +
            '), ';
          checkRole(gobj, key, par);
        });
      }
      $.each(gobj.children, function(index, child) {
        nChildren += 1;
        childList += ' #' + child.id;
        checkChild(gobj, child);
      });
      if (nParents && verbose)
        console.log(
          '  ',
          nParents,
          nParents > 1 ? 'parents:' : 'parent',
          parentList
        );
      if (nParents && verbose) console.log('  roles: ', roleList);
      if (nChildren && verbose)
        console.log(
          '  ',
          nChildren,
          nChildren > 1 ? 'children:' : 'child',
          childList
        );
      if (gobj.transParent) {
        transParentList = gobj.transParent.id;
        checkTransParent(gobj.transParent);
      }
      if (gobj.transChildren) {
        $.each(gobj.transChildren, function(index, transChild) {
          nTransChildren += 1;
          transChildList += ' #' + transChild.id;
          checkTransChild(gobj, transChild);
        });
      }

      if (cycleGobjs.length === 0) {
        // start the check with gobj as the startGobj and walk down from all the children of gobj
        checkCycle(gobj, gobj);
      }
    });
    if (cycleGobjs.length > 0) {
      console.error({ title: 'CYCLE: ', gobjs: cycleGobjs });
    }
    graphOK = graphOK && cycleGobjs.length === 0 && topoConflicts.length === 0;
    if (showTopo) {
      $.each(sketch.gobjList.constraintList, function(key, gobj) {
        let topoLine;
        topoLine =
          'T' +
          gobj.topologicalIndex +
          ' #' +
          gobj.id +
          ' ' +
          gobj.kind +
          ' ' +
          (gobj.label ? '"' + gobj.label + '"' : '') +
          ' ' +
          gobj.constraint;
        $.each(gobj.children, function(key, child) {
          if (key === 0) {
            topoLine += '   children: ';
          }
          topoLine +=
            ' (T' +
            child.topologicalIndex +
            '  #' +
            child.id +
            ': ' +
            child.kind;
          if (child.label) topoLine += ' "' + child.label + '" ';
          topoLine += ')';
        });
        topoData.push({ index: gobj.topologicalIndex, data: topoLine });
      });
      console.log('%cTopological Order', errorStyle);
      checkConstraintListOrder();
      $.each(topoData, function(key) {
        console.log(topoData[key].data);
      });
    }
    console.log(graphOK ? 'Sketch graph is ok.' : 'Sketch graph is bad.');
    return graphOK;
  }

  function removeHiddenLabels(sketchOrSelector) {
    // selector is either a sketch or the id of a sketch_canvas
    const sketch = getSketch(sketchOrSelector),
      gobjects = sketch.gobjList.gobjects;
    $.each(gobjects, function() {
      if (this.label && this.style.hidden) {
        this.label = '';
      }
    });
  }

  function showGobjIds(sketchOrSelector) {
    // selector is either a sketch or the id of a sketch_canvas
    const sketch = getSketch(sketchOrSelector),
      gobjects = sketch.gobjList.gobjects;
    if (TOOLS.showIds) {
      $.each(gobjects, function() {
        if (this.label) {
          this.state.oldLabel = this.label;
          this.state.oldShowLabel = !this.style.label.hidden;
          this.label = this.id;
          this.style.label.hidden = false;
        }
      });
    } else {
      $.each(gobjects, function() {
        if (this.state.oldLabel) {
          this.label = this.state.oldLabel;
        }
        if (this.state.oldShowLabel) {
          delete this.style.label.hidden;
          this.style.label.hidden = this.state.oldShowLabel;
        }
      });
    }
  }

  return {
    // public functions and variables for TOOLS

    initViewer: function() {
      initSketchList('uSketchList');
    },

    initLibrary: function() {
      initLib('uToolList');
    },

    loadLibraryTools: function(collection) {
      // collection is the subdirectory that contains the tool jsons to be loaded.
      loadTools(collection);
    },

    insertPage: function(id, option) {
      insertPage(id, option);
    },

    deletePage: function(id) {
      deletePage(id);
    },

    resetSketchWindowSize: function(id) {
      if (!dragResizing) {
        resetWindowSize('#' + id);
      }
    },

    insertToolInSketch: function(id, index) {
      insertTool('#' + id, index);
    },

    loadSketchList: function() {
      loadSketches();
    },

    loadMultipleSketches: function(fileList) {
      doLoadMultiple(fileList);
    },

    scrollToSketch: function(listItem) {
      scrollToSketch(listItem);
    },

    checkSketchGraph: function(sketchOrSelector, mode) {
      return checkGraph(sketchOrSelector, mode);
    },

    removeHiddenLabels: function(sketchOrSelector) {
      return removeHiddenLabels(sketchOrSelector);
    },

    showGobjIds: function(sketchOrSelector) {
      return showGobjIds(sketchOrSelector);
    },

    populateTools: function(selector) {
      var doc = getCanvas(selector).data('document');
      populateTools(doc);
    },
  };
})();

$(function() {
  if ($('#libSketch').length) {
    TOOLS.initLibrary();
  } else if ($('#loadSketches').length) {
    TOOLS.initViewer();
  }
});
