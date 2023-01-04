// JavaScript for the WSP Tool Library and the WSP Sketch Viewer. There's enough common code
// to justify putting these together.
var TOOLS = (function() {
  var allTools = [],
    filesToProcess = [],
    nextSketchDivID = 1,
    $resize, // The resize control in the tool library window
    // To extend resizing to the viewer, we'll need each sketch to maintain a pointer
    // to its own resize control.
    dragResizing, // true if the user is dragging the resize control
    debugMode;

  PREF.setWebPagePrefs([
    { category: 'util', name: 'upload', sketches: 'all' },
    { category: 'util', name: 'download', sketches: 'all' },
  ]);

  function addToolToTable(tool, firstTool, lastTool) {
    var table = $('#toolTable');
    var img;
    var toolIndex = allTools.length;
    var content =
      '<div class="toolItem" onclick="TOOLS.insertToolInSketch (' +
      "'libSketch'," +
      toolIndex +
      ');"></div>';
    var cell = $.parseHTML(content);
    table.append(cell);
    if (tool.image) {
      img = new Image();
      img.src = tool.image.src;
      $(cell).append(img);
    } else {
      $(cell).append('<br>' + tool.metadata.name);
    }
    if (firstTool) $(cell).addClass('firstToolItem');
    if (lastTool) $(cell).addClass('lastToolItem');
    allTools.push(tool);
  }

  function loadOneJSON() {
    var fName;
    if (filesToProcess.length === 0) return;
    fName = filesToProcess.shift(); // remove the first element
    $.getJSON(fName, function(data) {
      var last = data.tools.length - 1;
      data.tools.forEach(function(tool, index) {
        var img = tool.metadata.image;
        if (typeof img !== 'undefined')
          tool.image = data.resources.pictures[img];
        addToolToTable(tool, index === 0, index === last);
      });
      loadOneJSON(); // Load the next file in the queue only after this one has been processed.
    });
  }

  /*
    function loadTools(pattern){  // Initiate the loading of tools from a directory specified by pattern.
      // Once the directory is loaded, its file names are cached in a queue, and loadOneTool is called
      // to process the queue one file at a time. Would it be OK to call .getJSON for multiple files without worrying
      // about the order in which the success() functions are processed? There's likely little harm in doing one file at a time.
      $("#toolTable").empty();
      $.ajax({
        type: "POST",
        data: ({filter: pattern}),
        url: "./get_files.php",
        cache: false,
        success: function(result){
          if (result.length > 0) {
            result.forEach (function (element) {
              filesToProcess.push (element);
              });
            loadOneJSON ();
          }
        },
        datatype: "json"
      });
    }
    */

  function loadTools(pattern) {
    // Initiate the loading of tools from a directory specified by pattern.
    // Once the directory is loaded, its file names are cached in a queue, and loadOneTool is called
    // to process the queue one file at a time. Would it be OK to call .getJSON for multiple files without worrying
    // about the order in which the success() functions are processed? There's likely little harm in doing one file at a time.

    function loadFiles(data) {
      if ($.isArray(data) && data.length > 0) {
        data.forEach(function(element) {
          filesToProcess.push(element);
        });
        loadOneJSON();
      }
    }

    $('#toolTable').empty();
    $.ajax({
      type: 'POST',
      data: { filter: pattern },
      url: './get_files.php',
      cache: false,
      success: loadFiles,
      datatype: 'json',
    });
  }

  function insertTool(selector, index) {
    // insert at end
    var theTool = allTools[index],
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
    setResizePosition($canvas);
    populateTools(doc);
  }

  /*
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

  /*jslint eval */

  /*property
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

      var objects = new WeakMap(); // object to path mappings

      return (function derez(value, path) {
        // The derez function recurses through the object, producing the deep copy.

        var old_path; // The path of an earlier occurance of value
        var nu; // The new object or array

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

          old_path = objects.get(value);
          if (old_path !== undefined) {
            return { $ref: old_path };
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

      var px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;

      (function rez(value) {
        // The rez function walks recursively through the object looking for $ref
        // properties. When it finds one that has a value that is a path, then it
        // replaces the $ref object with a reference to the value that is found by
        // the path.

        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            value.forEach(function(element, i) {
              if (typeof element === 'object' && element !== null) {
                var path = element.$ref;
                if (typeof path === 'string' && px.test(path)) {
                  value[i] = eval(path);
                } else {
                  rez(element);
                }
              }
            });
          } else {
            Object.keys(value).forEach(function(name) {
              var item = value[name];
              if (typeof item === 'object' && item !== null) {
                var path = item.$ref;
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
  function adjustPageNumbers(sketch, doc, pageNum, option) {
    // adjust page #s, starting with pageNum
    // pageNum is the page # of the page inserted or deleted
    var ix,
      newID,
      sketchPages = sketch.pages; // zero-based, so index is 0 for page #1
    for (ix = pageNum - 1; ix < sketch.pages.length; ix++) {
      newID = (ix + 1).toString();
      if (sketchPages[ix].metadata.title === sketchPages[ix].metadata.id) {
        sketchPages[ix].metadata.title = newID; // change the title only if title matches id
      }
      sketchPages[ix].metadata.id = newID;
    }
    PAGENUM.setToolEnabling(doc); // Sync the page_toggle styles of the tool buttons to agree with the changed prefs
  }

  /* Things possibly helpful to create the new page...
  
  From wsp-runner.js"
                  getGSPInstance(data).then(function(gspInstance) {
                      createDocumentFromJSONData(gspInstance, data, $target, options);
                      GSP.log("Loaded Sketch: " + options.url || options.varName);     
                  }); 
   **/

  function setCanvas(selector) {
    // selector is either a string identifying the id of the sketch_canvas,
    // or a jQuery selector of a button or command in the same sketch_container as the sketch_canvas
    if (typeof selector === 'string') {
      return $('#' + selector);
    } else {
      return $(selector)
        .parents('.sketch_container')
        .find('.sketch_canvas');
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
    var canvas = setCanvas(selector),
      doc = canvas.data('document'),
      theSketchJSON = doc.sQuery().getSketchJSON(), // already stringified
      sketch = JSON.parse(theSketchJSON), // the copy of the sketch in which we will make our changes
      pageNum = +doc.focusPage.metadata.id, // the number of the page to be deleted
      numPages = sketch.pages.length,
      $pageButtons = $(canvas)
        .parent()
        .find('.page_buttons');

    function userConfirm() {
      // show confirmation dialog here
      return true;
    }

    function removePageData() {
      // the keys of doc.pageData are the page id's. The contents must be closed up.
      var ix,
        newID,
        meta,
        pageData = doc.pageData;
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
      var key,
        item,
        list,
        prefs = doc.docSpec.metadata.authorPreferences; // the master copy of prefs
      for (key in prefs) {
        if (prefs.hasOwnProperty(key)) {
          item = prefs[key];
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
        }
      }
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
    doc.switchPage(pageNum, true); // This is now a no-op, but changes the displayed page #.
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
    var canvas = setCanvas(selector),
      doc = canvas.data('document'),
      theSketchJSON = doc.sQuery().getSketchJSON(), // already stringified
      sketch = JSON.parse(theSketchJSON), // the copy of the sketch in which we will make our changes
      curPageNum = doc.focusPage.metadata.id,
      newPageNum = (+curPageNum + 1).toString(),
      newPage = JSON.parse(JSON.stringify(sketch.pages[curPageNum - 1])), // copy the current page's sketch.pages data
      rect = newPage.metadata.sketchRect,
      newPageData,
      $pageButtons = $(canvas)
        .parent()
        .find('.page_buttons');

    function insertPageData(pageNum, data) {
      // the keys of doc.pageData are the page id's. The contents all have to be moved to make space for the new data
      // At the same time, adjust the docSpec authorPrefs for any prefs that are based on page numbers.
      var ix,
        newID,
        meta,
        pageData = doc.pageData;
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
      var key,
        item,
        list,
        prefs = doc.docSpec.metadata.authorPreferences; // the master copy of prefs
      for (key in prefs) {
        if (prefs.hasOwnProperty(key)) {
          item = prefs[key];
          if (typeof item === 'string' && item.match(/^\d+(,\d+)*$/)) {
            // Every element >= newPageNum should be incremented
            list = item.split(',');
            list.forEach(function(val, i, arr) {
              arr[i] = +arr[i];
            }); // avoid issues of string/number conversion
            for (jx = list.length - 1; list[jx] >= newPageNum - 1; jx--) {
              if (list[jx] >= newPageNum) {
                list[jx] = list[jx] + 1;
              } else if (list[jx] === +curPageNum) {
                // copy curPageNum settings for the new page
                list.splice(jx + 1, 0, +newPageNum);
              }
            }
            prefs[key] = list.join(',');
          }
        }
      }
      doc.metadata.authorPreferences = JSON.parse(JSON.stringify(prefs));
    }

    function copySessionData() {
      // copy session data from original page
      var oldSession = doc.pageData[curPageNum].session,
        newSession;
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
    newPageData = JSON.retrocycle(JSON.decycle(doc.pageData[curPageNum]));
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
    var $sketchNode = $(selector),
      doc = $sketchNode.data('document'),
      newHeight = +$('#height')[0].value,
      newWidth = +$('#width')[0].value,
      baseNode = $sketchNode.find('.wsp-base-node')[0],
      toolWidth = $sketchNode.find('.wsp-tool-container').css('width'),
      fullWidth = newWidth + parseInt(toolWidth),
      dpRatio = window.devicePixelRatio,
      $canvases = $('.wsp-clip-node', baseNode).find('canvas');

    function fixSketchRect(target) {
      var rect = target.sketchRect;
      rect.bottom = rect.top + newHeight;
      rect.right = rect.left + newWidth;
    }

    function fixToolContainer(height, width) {
      // Here we fix up the height of the tool-container to be full height and to show a scroll bar if needed.
      var column = $sketchNode.find('.wsp-tool-column')[0],
        fixedHeight = 0,
        toolsHeight = 0,
        $buttonArea = $sketchNode.parent().find('.button_area');
      $('.wsp-fixed-tool', column)
        .filter(':visible')
        .each(function() {
          fixedHeight += $(this).outerHeight();
        });
      $('.wsp-tool', column)
        .filter(':visible')
        .each(function() {
          toolsHeight += $(this).outerHeight();
        });
      $('.wsp-tool-column', $sketchNode).outerHeight(height);
      $('.wsp-user-tools', $sketchNode).outerHeight(height - fixedHeight);
      // Set outerHeight for wsp-user-tools.
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
    $.each(doc.pageData, function(key, value) {
      fixSketchRect(value.spec.metadata);
    });
    fixSketchRect(doc.focusPage.metadata);
    doc.docSpec.metadata.height = newHeight;
    doc.docSpec.metadata.width = newWidth;
    $('.wsp-clip-node', baseNode).css({ width: newWidth, height: newHeight });
    $canvases.each(function() {
      // Set new size and scale for each canvas, without changing the scale.
      var ctx = this.getContext('2d'),
        trans = ctx.getTransform(); // cache the current transform
      //this.width = newWidth;
      //this.height = newHeight;
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
      fullWidth *= 0.75;
      newHeight *= 0.75;
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
    var $clipNode = $sketchNode.find('.wsp-clip-node'),
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
      var trial, nodes;

      function check() {
        return $(this).text() == trial;
      }

      var i = 0;
      var $test = $('#uSketchList li');
      seed = seed.replace(/-\d+/, '');
      seed = seed + '-';
      do {
        i += 1;
        trial = seed + i;
        nodes = $test.filter(check);
      } while (nodes.length > 0);
      return trial;
    }

    var canvasNode = $($('.sketch_canvas')[index]);
    var doc = canvasNode.data('document');
    var theSketchJSON = doc.sQuery().getSketchJSON(); // already stringified
    var theName = uniqueName(canvasNode.data('fileName'));
    addSketchToPage(theName, theSketchJSON);
  }

  function dragToolCallback(dragIndex, target) {
    var $canvas = $('#libSketch'),
      doc = $canvas.data('document'),
      targetIndex = $(target).data('index'),
      specTemp = doc.docSpec.tools.splice(dragIndex, 1), // Remove this element from the tools array
      docTemp = doc.tools.splice(dragIndex, 1),
      $tools = $('.wsp-tool', $canvas),
      $temp = $($tools[dragIndex]).detach();
    if (!$(target).hasClass('uTrashIcon')) {
      doc.docSpec.tools.splice(targetIndex, 0, specTemp[0]); // Move the dragged tool, instead of deleting
      doc.tools.splice(targetIndex, 0, docTemp[0]);
      if (targetIndex < dragIndex) {
        // dragging up
        $temp.insertBefore($tools[targetIndex]);
      } else {
        // dragging down
        $temp.insertAfter($tools[targetIndex]);
      }
    }
    populateTools(doc);
  }

  function dragSketchCallback(dragIndex, target) {
    // the dragged item has been dropped on a target
    var allTargets, $dragNode, targetIndex;
    if (target.id === 'clone') {
      cloneSketch(dragIndex);
    } else if (target.id === 'trash') {
      $($('.sketch_container')[dragIndex]).remove();
    } else {
      // handle an actual move
      $dragNode = $($('.sketch_container')[dragIndex]).detach();
      allTargets = $('.sketch_container');
      targetIndex = $(target).data('index');
      if (targetIndex < allTargets.length)
        $dragNode.insertBefore($('.sketch_container')[targetIndex]);
      else $dragNode.insertAfter($('.sketch_container')[targetIndex - 1]);
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
    var $dragNode = $('#' + dragListID);

    function checkTarget(event) {
      var retNode = event.target;
      if (retNode.nodeName === '#text') retNode = retNode.parentNode;
      if (retNode.parentNode.id === dragListID) return retNode;
      else return null;
    }

    document.addEventListener('dragstart', function(event) {
      var dragIndex = $(event.target).data('index');
      $dragNode.data('dragIndex', dragIndex);
      event.dataTransfer.setData('text/html', dragIndex);
      event.dataTransfer.effectAllowed = 'move';
    });

    document.addEventListener('dragover', function(event) {
      var target = checkTarget(event);
      event.preventDefault();
      if (target) $(target).addClass('uOutline');
    });

    document.addEventListener('dragleave', function(event) {
      var target = checkTarget(event);
      event.preventDefault();
      if (target) $(target).removeClass('uOutline');
    });

    document.addEventListener('drop', function(event) {
      var targetIndex,
        target,
        dragIndex = $dragNode.data('dragIndex');
      target = checkTarget(event);
      event.preventDefault();
      if (target) {
        targetIndex = $(event.target).data('index');
        $(target).removeClass('uOutline');
        if (target.index != dragIndex) {
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
    var doc = $('#libSketch').data('document'),
      sketch = doc.focusPage,
      pageNum = +sketch.metadata.id,
      prefs = doc.metadata.authorPreferences,
      specPrefs = doc.docSpec.metadata.authorPreferences,
      prefName = toolName + 'tool',
      prefArr = doc.getAuthorPreference(prefName), // returns an array, defaulting to ["all"]
      sketchPages = Object.keys(doc.pageData),
      idx;

    /*
     * Do we need both prefArr and newPrefArr?
     * It seems that prefArr, starting as the current pref array and ending as an array of page #s,
     * is the way to go.
     */

    function allPages() {
      // create an array with all page #'s
      var retVal = [],
        ix;
      for (ix = 0; ix < sketchPages.length; ix++) {
        retVal.push(+sketchPages[ix]);
      }
      return retVal;
    }

    function setPref(arr) {
      // sets the passed value for prefName in both doc and docSpec prefs
      var prefString = arr.join();
      prefs[prefName] = prefString;
      specPrefs[prefName] = prefString;
    }

    if (!prefArr || prefArr[0] === 'all') {
      // doesn't yet exist, so initialize to all or leave empty
      prefArr = allPages();
    } else if (prefArr[0] === 'none') {
      prefArr = [];
    } else {
      // convert string elements to page #s (Can we drop this??)
      prefArr.forEach(function(val, ix) {
        prefArr[ix] = +val;
      });
    }

    idx = prefArr.indexOf(pageNum);
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
    var $btn = $(ev.target),
      toolIndex = $btn.parent().data('index'),
      $tool = $('.wsp-tool', '#libSketch').eq(toolIndex);
    console.log(ev);
    setToolPref(ev.target.value, $tool, $btn[0].checked);
  }

  function checkTools(sketchDoc, context) {
    // Check or uncheck the tool checkboxes for the current page
    // Can be called directly with a sketchDoc or from a DidChangeCurrentPage event
    // In the former (direct) case, context is undefined.
    // In the latter (event) case, context.document is actually the sketch doc.
    var $list = $('#uToolList'),
      index = 0;
    if (context) {
      sketchDoc = context.document;
    }
    if (sketchDoc.tools) {
      $.each(sketchDoc.tools, function(i, val) {
        var prefName = val.metadata.name.toLowerCase().replace(/\s+/g, ''),
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
      $('.toolCheck').change(TOOLS.handleToolCheck);
    }
  }

  function populateTools(sketchDoc) {
    var $list = $('#uToolList'),
      prefs = sketchDoc.metadata.authorPreferences;
    $list.empty();
    if (sketchDoc.tools) {
      $.each(sketchDoc.tools, function(i, val) {
        var name = val.metadata.name,
          prefName = name.toLowerCase().replace(/\s+/g, ''),
          content =
            '<li draggable="true"><input type="checkbox" class = "toolCheck" value=' +
            prefName +
            '>' +
            name +
            '</li>';
        $list.append(content);
        $list
          .children()
          .last()
          .data('index', i);
      });
      $('.toolCheck').change(TOOLS.handleToolCheck);
    }
    if ($list.length) {
      $list.append('<li class="uTrashIcon"></li>');
      checkTools(sketchDoc);
    }
  }

  function initLib(listID) {
    var $node = $('#libSketch'),
      $nameNode = $('#libFileName'),
      $width = $('#width'),
      $height = $('#height');
    $resize = $('#resize');

    function updateSketchName(name) {
      if (name) {
        if (name.indexOf('.') > 0)
          // remove extension if any
          name = name.substring(0, name.lastIndexOf('.'));
        $nameNode.text(name);
        $('#utilPrompt').css('display', 'none');
        $nameNode.css('display', 'inline-block');
      }
    }

    function checkQuery(prop) {
      var params = {};
      var st = window.location.href.slice(
        window.location.href.indexOf('?') + 1
      );
      var endIndex = st.indexOf('#');
      if (endIndex >= 0) st = st.slice(0, endIndex);
      var search = decodeURIComponent(st);
      var definitions = search.split('&');
      definitions.forEach(function(val) {
        var parts = val.split('=', 2);
        params[parts[0]] = parts[1];
      });
      if (prop && prop in params) return params[prop] || prop;
      else if (!prop) return params;
      // return undefined if prop is passed but does not exist as a param
    }

    function populatePrefs() {
      var doc = $('#libSketch').data('document'),
        prefs = doc.metadata.authorPreferences,
        key,
        st;
      $('#uPrefList').empty();
      for (key in prefs) {
        if (prefs.hasOwnProperty(key)) {
          st = '<li>' + key + ': &nbsp; ' + prefs[key] + '</li>';
          $('#uPrefList').append(st);
        }
      }
    }

    /*
     * Code based on https://javascript.info/mouse-drag-and-drop, and then adapted
     * to work on mobile devices
     */
    var resizer = $resize[0];
    resizer.addEventListener('touchstart', function(e) {
      e.preventDefault();
      startResize(e, true);
    });

    resizer.addEventListener('mousedown', startResize);

    function startResize(e, isTouch) {
      var origSize = { width: +$width.val(), height: +$height.val() },
        origLoc = { x: e.pageX, y: e.pageY },
        shiftX = e.clientX - resizer.getBoundingClientRect().left,
        shiftY = e.clientY - resizer.getBoundingClientRect().top,
        wait = false; // throttle the mouse movement events

      // moves the resizer to (pageX, pageY) coordinates
      // taking initial shifts into account
      function moveTo(pageX, pageY) {
        var width, height;
        if (wait) return; // don't handle this event if one has just occurred
        wait = true;
        setTimeout(function() {
          wait = false;
        }, 50); // don't handle another for 50 ms.
        (width = Math.max(100, origSize.width + pageX - origLoc.x)),
          (height = Math.max(100, origSize.height + pageY - origLoc.y));
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
      var urlToLoad = checkQuery('sketch-url');
      if (urlToLoad) {
        $node.data('url', urlToLoad);
        // loadFromUrl (urlToLoad, $node);
      }
    }

    resizer.ondragstart = function() {
      return false;
    };

    function setupDebug() {
      var $prefBtn = $('#uPrefToggle'),
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

    $node.on('LoadDocument.WSP', function(event, context) {
      var doc = context.document,
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
      PREF.setWebPagePrefs([{ category: 'widget', pages: 'all' }]);
    }
    checkLoadFromUrl();
    initToolList(listID);
    loadTools('basic/*.json');
  } // initLib

  function scrollToSketch(listItem) {
    var index = $(listItem).data('index');
    var canvasNode = $('.sketch_canvas')[index];
    $([document.documentElement, document.body]).animate(
      {
        scrollTop: $(canvasNode).offset().top,
      },
      1000
    );
  }

  function repopulateSketchControl() {
    var list = $('#uSketchList');
    var sketches = $('.sketch_canvas');
    list.empty();
    $.each(sketches, function(index, node) {
      var name = $(node).data('fileName');
      if (typeof name === 'undefined') return;
      var content =
        '<li draggable="true" onclick="TOOLS.scrollToSketch(this);">' +
        $(node).data('fileName') +
        '</li>';
      var el = list.append(content);
      $(el[0].lastChild).data('index', index);
    });
    list.append('<li id = "clone" class="uCloneItem"> Clone</li>');
    list.append('<li class="uTrashIcon"></li>');
  }

  function addSketchToPage(fName, jsonData) {
    var el, canvasNode, content;
    var id = 'sketchDiv' + nextSketchDivID;
    nextSketchDivID += 1;
    content =
      '<div class="sketch_container"> <div class="sketch_canvas" id="' +
      id +
      '" data-url="empty.json" > </div> <div style="clear:both"> <div class="util-menu-btn"></div> <span class="page_buttons"></span> <button class="widget_button" onclick="WIDGETS.toggleWidgets(this);">Widgets</button> <p class="fileName"></p> <input type="button" class="newPageButton" value="New Page" onclick="TOOLS.insertPage(this,/new/");"/> <input type="button" class="newPageButton" value="Clone Page" onclick="TOOLS.insertPage(this,/"clone/");"/> </div> </div>';
    el = $(content);
    el.find('.fileName')[0].innerHTML = fName.replace('.json', '');
    $('#sketches').append(el);
    UTILMENU.initUtils(); // set up onLoad handler for the new sketch_canvas
    PAGENUM.initPageControls();
    canvasNode = $('#' + id);
    canvasNode.data('fileName', fName.replace('.json', ''));
    canvasNode.data('sourceDocument', jsonData);
    canvasNode.WSP('loadSketch');
    canvasNode.removeData('sourceDocument'); // Once the data's loaded, it's no longer needed here
    canvasNode.on('LoadDocument.WSP', function() {
      var el = $(this)
        .parent()
        .find('.fileName');
      if (el && el.length > 0) el[0].innerHTML = $(this).data('fileName');
      repopulateSketchControl();
    });
    repopulateSketchControl();
  }

  function doLoadMultiple(files) {
    $.each(files, function() {
      var reader = new FileReader();
      reader.fileName = this.name;
      reader.onload = function() {
        addSketchToPage(this.fileName, this.result);
      };
      reader.readAsText(this);
    });
  }

  function loadSketches() {
    var fileInput = $('#file-name-input');
    fileInput.attr('multiple', '');
    fileInput.attr('onchange', 'TOOLS.loadMultipleSketches(files);');
    fileInput.click();
    fileInput.removeAttr('multiple');
  }

  function checkGraph(selector, mode) {
    // selector is the id of a sketch_canvas
    var doc = $('#' + selector).data('document'),
      sketch = doc.focusPage,
      gobjects = sketch.gobjList.gobjects,
      graphOK = true,
      verbose = mode && mode.match(/verbose/i),
      showTopo = mode && mode.match(/topolog/i),
      cycleGobjs = [],
      topoConflicts = [],
      topoData = [],
      errorStyle = 'color: red; font-weight:bold; font-size:larger;';

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
      if (child.parentsList.indexOf(gobj) < 0) {
        console.log(
          '%cCould not find ' + gobj.id + ' as a parent of ' + child.id,
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
      var retVal = cycleGobjs.length > 0,
        topoError;
      // Return true if startGobj is a child of gobj. Otherwise search all children of gobj
      // During recursion, verify that the topoligicalIndex of the child is greeater than the parent
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
      var ok = true,
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
          '%c' + 'Constraint List is not in topological order.',
          errorStyle
        );
      }
    }

    $.each(gobjects, function(key, gobj) {
      var parentList = '',
        roleList = '      ',
        childList = '',
        nParents = 0,
        nChildren = 0;
      if (verbose)
        console.log(
          '#' + gobj.id,
          ' ',
          gobj.kind,
          gobj.label ? '"' + gobj.label + '"' : '',
          ' T' + gobj.topologicalIndex,
          ' ',
          gobj.constraint,
          ' ',
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
          nParents > 1 ? ' parents:' : ' parent',
          parentList
        );
      if (nParents && verbose) console.log('  roles: ', roleList);
      if (nChildren && verbose)
        console.log(
          '  ',
          nChildren,
          nChildren > 1 ? ' children:' : ' child',
          childList
        );
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
        var topoLine;
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
          if (key === 0) topoLine += '   children: ';
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

  function getCanvas(selector) {
    // selector is either a string identifying the id of the sketch_canvas,
    // or a jQuery selector of a button or command in the same sketch_container as the sketch_canvas
    let jqSel;
    if (selector.anchorNode) {
      return selector.anchorNode; // sketch
    } else if (typeof selector === 'string') {
      jqSel = selector[0] !== '.' && selector[0] !== '#' ? '#' : '';
      jqSel += selector;
      if ($(jqSel).hasClass('sketch_canvas')) {
        return $(jqSel);
      } else {
        // selector must be a DOM node inside the sketch_container
        return $(selector)
          .parents('.sketch_container')
          .find('.sketch_canvas');
      }
    }
  }

  function getSketch(selector) {
    if (selector.anchorNode) {
      return selector;
    } else {
      return getCanvas(selector).data('document').focusPage;
    }
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

  return {
    // public functions and variables for TOOLS

    initViewer: function() {
      initSketchList('uSketchList');
    },

    initLibrary: function() {
      initLib('uToolList');
    },

    loadLibraryTools: function(pattern) {
      loadTools(pattern);
    },

    insertPage: function(id, option) {
      insertPage(id, option);
    },

    deletePage: function(id) {
      deletePage(id);
    },

    resetSketchWindowSize: function(id) {
      if (!dragResizing) resetWindowSize('#' + id);
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

    checkSketchGraph: function(id, mode) {
      return checkGraph(id, mode);
    },

    removeHiddenLabels: function(sketchOrSelector, mode) {
      return removeHiddenLabels(sketchOrSelector, mode);
    },

    handleToolCheck: function(btn) {
      handleToolCheck(btn);
    },
  };
})();

$(function() {
  if ($('#libSketch').length) TOOLS.initLibrary();
  else if ($('#loadSketches').length) TOOLS.initViewer();
});
