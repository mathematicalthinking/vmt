/*!
	Web Sketchpad Sketch Runner. Copyright &copy; 2016 KCP Technologies, a McGraw-Hill Education Company. All rights reserved. 
	Version: Release: 2015Q4Update2, Semantic Version: 4.5.1-alpha, Build Number: 1020, Build Stamp: stek-macbook-pro.local/20190331013328
*/
(function () {
 /* When a file is loaded by data-var, there are several requirements for the supplied variable name.
  * It must be a legal name for a javascript variable and not duplicate any name already in the global namespace.
  * It must be a legal URL and a legal filename for Mac, Win, and Unix.
  * The returned value 
  * Filename code adapted from node-sanitize (https://github.com/parshap/node-sanitize-filename/blob/master/index.js)
  *
  * For now, we require that the alphabetic characters in JavaScript identifiers be from standard ASCII (Latin alphabet)
  * or from the Greek alphabet. 
  * Replaces characters in strings that are illegal/unsafe for filenames.
  * Unsafe characters are either removed or replaced by a substitute set
  * in the optional `options` object.
  *
  * Illegal Characters on Various Operating Systems
  * / ? < > \ : * | "
  * https://kb.acronis.com/content/39790
  *
  * Unicode Control codes
  * C0 0x00-0x1f & C1 (0x80-0x9f)
  * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
  *
  * Reserved filenames on Unix-based systems (".", "..")
  * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
  * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
  * "LPT9") case-insesitively and with or without filename extensions.
  *
  */


  var jsReserved =/^(do|if|in|for|let|new|try|var|case|else|enum|eval|null|this|true|void|with|await|break|catch|class|const|false|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/;
  
  var illegalRe = /[\/\?<>\\:\*\|":]/g; // Illegal chars for filenames
  var controlRe = /[\x00-\x1f\x80-\x9f]/g;  // control codes are illegal
  var reservedRe = /^\.+$/;
  var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
  var digits = /\d+$/;  // identify trailing digits
  var jsIdentifierFilter = /^[^a-zA-Zα-ωΑ-Ω_$]|[^0-9a-zA-Zα-ωΑ-Ω_$]/g;  // use to replace possibly invalid chars
  
  function normalize (name, allow) {
    // pass allow.suffix or allow.path to allow suffix or path to remain.
    var path; // cache the path if it's to be allowed.

    function getPath (fName) {
      var i = fName.lastIndexOf ('/');
      return (i < 0) ? "" : fName.substring (0, i + 1);
    }
    
    function removePathAndSuffix (fName) {
      var st, retVal = fName;
      st = retVal.split ('.');
      if (st[0] && st.length > 1 && !allow.suffix) { // remove suffix
        retVal = st[0];
      }
      st = retVal.split ('/');
      if (st.length > 1 && st[st.length - 1]) {
        retVal = st[st.length - 1];
      }
      return retVal;
    }
    
    function incrementIfNeeded (st) { // if st matches an identifier, a Windows reserved word,
            // or a name defined in the global namespace, increment its numeric suffix
      var n;
      while (st.match (jsReserved) || st.match (windowsReservedRe) || typeof window[st] !== "undefined") {
        if (!st.match (digits))
          st += "0";
        n = st.match (digits)[0];
        st = st.replace (digits, +n + 1);
      }
      return st;
    }
   
   function sanitize(input, replacement) {
      var sanitized = input
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement);
      var match = sanitized.match(windowsReservedRe);
      if (match) {
        sanitized += "1"; // if already used, will be incremented later
      }
      return sanitized;
    }
  
    function doSanitize (name, options) {
      var replacement = (options && options.replacement) || '';
      var newName = sanitize(name, replacement);
      if (replacement === '') {
        return newName;
      }
      return sanitize(newName, '');
    }
    
    function makeJsName (name) {  // Turn name into a legal js identifier (currently allowing only ASCII and Greek characters)
      // Prepend underscore to leading digit
      if (name[0].match(/[0-9]/)) {
        name = "_" + name;
      }
      // Replace non-matching characters with underscores
      return name.replace (jsIdentifierFilter, "_");
    }

    allow = allow || {};
    path = allow.path ? getPath (name) : "";  // cache the path if it's allowed
    name = name.normalize('NFKC');  // Normalize the name for compatibility (eg, change the ﬀ ligature into 'ff')
    name = removePathAndSuffix(name);
    name = doSanitize (name, {replacement: '_'});
    name = makeJsName(name);
    name = name.replace (/[_]+/, '_');  // Remove repeated underscores
    name = incrementIfNeeded (name);

    // FOR VALID CHARS IN A VARIABLE, SEE https://gist.github.com/mathiasbynens/6334847
    return (path || "") + name;
  }

/*  unitTest depended on forbidding duplicates, which is no longer supported

  function unitTest () {
    
    function check (st, expected) {
      var result = normalize (st);
      if (result !== expected)
        console.log ("WspNames.unitTest error: expected ", expected, " but result was ", result);
    }
    
    check ('that', 'that');
    check ('that', 'that1');
    check ('that', 'that2');
    check ('that', 'that3');
    check ('that', 'that4');
    check ('that', 'that5');
    check ('that', 'that6');
    check ('that', 'that7');
    check ('that', 'that8');
    check ('that', 'that9');
    check ('that', 'that10');
    check ('that', 'that11'); // that11
    check ('ligature ﬀ', 'ligature_ff'); // ligature_ff
    check ('con', 'con1');  // Illegal in Windows; should return con1
    check ('2', '_2');  // javascript variables cannot begin with a digit.
    check ('1', '_1');
    check ('1', '_3');  // _2 is already used, so increment the trailing numeric portion
    check ('com', 'com');  // Legal
    check ('com', 'com10');  // conversion to com1 makes it illegal; should turn into com10.
    check ('.test', '_test');  // period not allowed to start filenames
    check ('..testing', '_testing');  // no multiple periods
    check ('_test', '_test1');  // underscore is legal first char, but append 1 because already used
    check ('$this', '$this'); // $ is allowable first char
    check ('per.iod', 'per'); // remove suffix
    check ('1test', '_1test');  // variable cannot start with a digit; prepend an underscore: _1test
    check ('test12var', 'test12var'); // legal variable name
    check ('a+b', 'a_b');  // illegal in variables: a_b
    check ('a/b', 'b');  // The "a/" looks like a path name and is removed. 
    check ('a____b', 'a_b1'); // no repeated underscores
    check ('this', 'this1'); // no javascript reserved words
    check ('this', 'this2'); // no javascript reserved words
    window.alert3 = "";                 // define alert3 in global namespace
    check ('alert', 'alert1'); // alert is already defined in global namespace
    check ('alert', 'alert2'); // alert1 is not defined in global namespace, so comes up twice
    check ('alert', 'alert4'); // alert3 is skipped because it's defined in global namespace
    check ('includes/scripts/some_var', 'some_var'); // any leading file-name path is removed.
  }
  */
  
  /*  @param {string} name is the string to be converted into a legal filename / variable name
   *  @param {object} allow permits certain forms: {path: true} doesn't strip leading path name.
   *
   *  returns the (possibly modified) string that's legal for names of both variables and files.
   */
  GSP.normalizeSketchName = function (name, allow) {
    return normalize (name, allow);
  };
  
  // unitTest();  // unitTest depended on forbidding duplicates, which is no longer supported
})(); // WspNames


(function( $ ){

	var GSPConfig = window.GSPConfig,
      useIntObserver = typeof IntersectionObserver !== "undefined";

	function getVersion(gspInstance, field) {
		return parseInt(gspInstance.version[field], 10);
	}

	// Returns the latest instance whose major version matches the given
	// sketch json data.
	function doGetGSPInstance(majorJSON) {
		var i,
				instances,
				instance;


		function sortInstances() {
			instances.sort(function(a, b) {
				function cmp(field) {
					return getVersion(b, field) - getVersion(a, field);
				}
				return cmp('major') || cmp('minor') || cmp('patch');
			});
		}

		if (typeof GSPConfig === "object" &&
				GSPConfig.instances &&
				GSPConfig.instances.length > 0 &&
				majorJSON) {
			instances = GSPConfig.instances;
			sortInstances();
			for(i = 0;i < instances.length;i++) {
				instance = instances[i];
				if (instance.version.major === majorJSON) {
					return instance;
				}
			}
		}
		return null;
	}
  
  function fixSketch (data) { // The fix here corrects erroneous export of sketches with font-family = "\"Times New Roman\", sans-serif"
    var defaultList = ["\"Times New Roman\", serif","\"Arial\", sans-serif"],
        i, fontList,
        authorPrefs = data.metadata.authorPreferences,
        wspVersion = data.metadata['wsp-version'].split('.'),
        v49orEarlier = ! (wspVersion[0] > 4 || wspVersion[0] === 4 && wspVersion[1] > 9);  // constructibleGiven, other fixes weren't in exporter through v4.9
        
    function fixTimesFont (s) {
      if (typeof s === "string" && !$.isNumeric(s) && s.includes ('Times') && s.includes ('sans-serif'))
        s = s.replace ('sans-serif', 'serif');
      return s;
    }
    
    function fixGobjFont (gobj) {
      // Fix the gobj if its style lists "\"Times New Roman\", sans-serif"
      var fontStyle;
      if (gobj.style && gobj.style.label)
          fontStyle = gobj.style.label;
      if (!fontStyle)
        fontStyle = gobj.style;
      if (fontStyle && fontStyle["font-family"])
        fontStyle["font-family"] = fixTimesFont (fontStyle["font-family"]);
    }
    
    function fixCaseButton (gobj) {
      // Fix any _Case: buttons
      if  (gobj.kind === "Button" && gobj.label && gobj.label.match (/_Case:/i) && (gobj.constraint.match (/Hide/) || gobj.constraint.match (/Show/))) {
        gobj.constraint = "ActionButtonPresentCase";
        delete gobj.messages;
        gobj.label = gobj.label.replace (/_Case:/i, "").trim();
        if (!gobj.label) {
          gobj.label = "auto";  // the "auto" label will be fixed in constrain().
        }
      }
    }
  
    function fixLabel (gobj) {
      var nameOriginKey = "nameOrigin:";
      if (gobj.label && gobj.label.indexOf (nameOriginKey) === 0) {
        if (!gobj.style) {
          gobj.style = {};
        }
        gobj.style.nameOrigin = gobj.label.substring (nameOriginKey.length).trim();
        gobj.label = "";
      }
    }
    
    function fixPage (page) {
      // Fix the prefs
      $.each (page.preferences.text.textTypes, function (key, value) {
        if (!value["font-family"])
          value = value.label;
        if (value["font-family"])
          value["font-family"] = fixTimesFont (value["font-family"]);
      });
      if (page.objects) {
        $.each (page.objects, function (id, gobj) {
          fixGobjFont (gobj);
          fixCaseButton (gobj);
          fixLabel (gobj);
        });
      }      
    }

    function fixTool (tool) {
      // Fix any Calculator tools that use the expression "1+1" to be blank
      // Fix any GlideReflect tools to switch TranslateVector constraint to GlideReflect
      // Register any tool objects as constructibleGiven that have that label,
      // whose parents have labels that begin with "given",
      // and whose parents have no parents of their own.
      var thisTool = tool,
          constRole = "constructibleGiven",
          constRegEx = new RegExp('^' + constRole, "i"),
          constructibleConstraints = "Segment, Line, Ray, PolygonFromPoints, CircleFromTwoPoints, Arc3Points",
          name = tool.metadata.name,
          glideReflect =  name.match(/glide\xA0reflect/i); //
          
        function fixGlideReflection (gobj) {  // If the tool is intended as a glide reflect tool, make it so.
          // Stopgap: Until GSP desktop supports glide reflection, enable a glide reflection tool.
          // The tool name must include "glide" and "reflect"; if so, any "Reflect"
          // constraint will be converted to a "GlideReflect" constraint.
          if (gobj.constraint === "Reflect") {
            gobj.constraint = "GlideReflect";
            gobj.parents.vector = gobj.parents.mirror;
            delete gobj.parents.mirror;
          }
        }
        
        function deleteWithDescendants (id) { // recursively delete my descendants and then myself
          var found = false;
          $.each (tool.objects, function (i, gobj) {  // check all objects with index > id
            if (i - id > 0 && gobj.parents) {
              $.each (gobj.parents, function (j, par) {
                if (par === id) { // am I a parent of gobj?
                  found = true; // 
                  deleteWithDescendants (i);  // delete this child and its descendants
                }
              });              
            }
          });
          delete tool.objects[id];
          if (found) {
            GSP.signalErrorWithMessage ("Given marked for deletion has children!");
          }
        }
        
      if (tool.objects) {
        $.each (tool.objects, function (id, gobj) {
          var isConstructible,
              sortOrder, labelArr;
          if (gobj.expression && gobj.expression === "1+1")
              gobj.expression = "";
          if (gobj.toolRole === "given" && gobj.label === "delete") {
            deleteWithDescendants (id);
            return;
          }
          fixCaseButton (gobj);
          fixGobjFont (gobj);
          fixLabel (gobj);
          if (glideReflect) {
            fixGlideReflection (gobj);
          }
          // A constructible's label begins with constRole (case insensitive), and its constraint
          isConstructible = gobj.label && (constRegEx.test (gobj.label)) &&
              constructibleConstraints.indexOf (gobj.constraint) >= 0;
          if (isConstructible) {
            $.each(gobj.parents, function (key, idx) {
              var par = thisTool.objects[idx];
              isConstructible = isConstructible && par.constraint === "Free";
            });
            if (!isConstructible) {
              GSP.signalErrorWithMessage ("Improper constructibleGiven: " + gobj.constraint);
            } else {
              // If a tool object is labeled "constructibleGiven", drop that prefix. and any trailing colon or space.
              // Thus "constructibleGivenA, constructibleGiven:A, and constructibleGiven: A all become "A".
              gobj.toolRole = constRole;
              gobj.label = gobj.label.substring (constRole.length).trim();
              sortOrder = gobj.label.replace (/(\d*)\.*/, "$1");
              if (sortOrder) {
                gobj.label = gobj.label.substring (sortOrder.length).trim();
                gobj.givenSortOrder = parseInt (sortOrder, 10);
              }
              labelArr = gobj.label.split (":");
              gobj.label = labelArr.pop().trim(); // label is last element, whether or not a ":" is present.
              if (!gobj.label) {  // If label is empty, delete and hide it.
                delete gobj.label;
                if (gobj.style && gobj.style.label)
                  gobj.style.label.showLabel = false;
              }
              $.each(gobj.parents, function (key, idx) {
                var par = thisTool.objects[idx];
                par.toolRole = "givenParent";
              });
            }
          }
          if (gobj.toolRole === constRole && gobj.constraint === "PolygonFromPoints") {
            GSP.gConstraints.PolygonFromPoints.standardizeTool (tool, gobj);
          }
        });
      }
    }
    
    if (!data.resources)
      data.resources = {"fontList": defaultList};
    else if (!data.resources.fontList)
      data.resources.fontList =  defaultList;
    else {
      fontList = data.resources.fontList;
      for (i=0; i<fontList.length; ++i) {
        fontList[i] = fixTimesFont (fontList[i]);
      }
    }
    if (authorPrefs) {
      $.each (authorPrefs, function (oldKey, value) { // lowercase and strip spaces from the key
        var newKey = oldKey.toLowerCase().replace (/\s/g, "");
        if (newKey !== oldKey) {
          authorPrefs [newKey] = value;
          delete authorPrefs [oldKey];
        }
      });
    }
    if (v49orEarlier) { // In versions > 4.9, the exporter has already made these fixes
      if (data.pages) { // fix the doc
        $.each(data.pages, function (key, value) {
          fixPage (value);
        });
      }
      if (data.tools) { // fix the tools
        $.each(data.tools, function (key, value) {
          fixTool (value);
        });
      }
    }
  }

	function getGSPInstance(data) {
		var majorJSON;
		fixSketch (data);
		majorJSON = data && data.metadata && data.metadata['wsp-version']
			&& data.metadata['wsp-version'].split('.')[0];
		var deferred = $.Deferred();
		var gspInstance = doGetGSPInstance(majorJSON);
		var pathFunc, path;

		function lastTry() { deferred.resolve(doGetGSPInstance(majorJSON) || window.GSP); }

		// If we've got a GSP that works, we're done.
		if( gspInstance) {
			deferred.resolve(gspInstance);
		} else { // Otherwise, try and find one.
			pathFunc = GSP.getConfigValue("compatibilityVersionPath");
			path = pathFunc(majorJSON);
			$.ajax({
				url: path,
				dataType: "script",
				cache: true
			}).always(lastTry);
		}

		return deferred.promise();
	}

	/*
	 * Informs the user of a same origin policy violation from loading
	 * a json file from a page loaded from the local filesystem.
	 * 
	 * If a jquery or dom element is provided, its contents are replaced
	 * with the error message. Otherwise, normal logging is used.
	 */
	function sendSameOriginQuirkMsg(el) {
		var msg =
        'Your sketch cannot be loaded. This may be because you are using\n' +
        'the local file system and your browser\'s security policy\n' +
        'does not allow loading local files. To remedy this issue you can:\n' +
        '(a) export your sketch in script form rather than JSON form, or\n' +
        '(b) access your page through a web server.';
		if (el) {
			$(el).html('<pre class="wsp-error">' + msg + '</pre>');
		}
		else {
			GSP.signalErrorWithMessage(msg);
		}
	}
  
  function sendWrongFormatMsg (el, url) {
		var msg =
        'Your sketch (' + url + ') cannot be loaded.\n' +
        'If this sketch is in javascript form, it should be loaded\n' +
        'with data-var rather than data-url.\n' +
        'If it is actually in json form, its extension\n' +
        'should be ".json" rather than ".js".';
		if (el) {
			$(el).html('<pre class="wsp-error">' + msg + '</pre>');
		}
		else {
			GSP.signalErrorWithMessage(msg);
		}
  }

	function createDocumentFromJSONData(gspInstance, data, $target, options) {
		var sketch,
			isVersion4_2_1;
      
        // HACK ALERT! SS: I'm having trouble building GSPUnix properly and need to fix the version number,
        // which comes through as "Local Developer Build Number"
        if (data.metadata["wsp-build-number"] === "Local Developer Build Number") {
          data.metadata["wsp-build-number"] = "4";
          data.metadata["wsp-build-stamp"] = "stek";
          data.metadata["wsp-version"] = "4.8.0";
        }

				// The now deprecated applyDocumentDiff was present in 3.0+,
				// and removed in the version AFTER 4.2.1.  (see
				// wsp-test/two-diffs.html). So 4.2.1 is the only modern
				// release with both GSP.applyDocumentDiff and
				// document.applydocumentDelta.
				if (options.delta) {
					if (gspInstance.applyDocumentDiff) {
						isVersion4_2_1 =
							getVersion(gspInstance, 'major') === 4 &&
							getVersion(gspInstance, 'minor') === 2 &&
							getVersion(gspInstance, 'patch') === 1;
						if (!isVersion4_2_1) {
							// We are somewhere between 3.0.0 and 4.2.0. Although the two-diffs
							// bug will trigger on the second diff, at least they get
							// one good diff!
							gspInstance.applyDocumentDiff(data, JSON.parse(options.delta));
						}
						// else see below -- we apply the delta AFTER
						// construction, as the Document constructor did not
						// accept the documentDelta option at that time.
					}
					else {
						// We are at a version after 4.2.1. Just pass the delta to the constructor.
						options.sketchOptions = options.sketchOptions || {};
						options.sketchOptions.documentDelta = options.delta;
					}
				}

				//Note: there was once a time when Document constructor would return a sketch
				//This is no longer the case, but since here we may be running an old version of WSP,
				//we must continue to handle that case.
				var Document = gspInstance.Document;
				var docOrSketch = new Document($target, data, options.sketchOptions);
				sketch = docOrSketch.focusPage || docOrSketch;

				//	The new document is now attached to the node in the new Document() call abvove,
				//	so that it's already there when before firing the LoadDocument, LoadPage, and DidChangeCurrentPage events. 
				// $target.data(isSketch? "sketch" : "document", docOrSketch);	


				if (docOrSketch.start) { docOrSketch.start(); }
				else if (docOrSketch.startCurrentFocusedSketch) {
					docOrSketch.startCurrentFocusedSketch();
				}

				// Special case for doc delta in version 4.2.1 -- see above
				if (options.delta && isVersion4_2_1) {
					docOrSketch.applyDocumentDelta(options.delta);
				}

				if( !options.autoStart) {
					sketch.pause();
				}

				if( options.onReady) {
					options.onReady.call($target, sketch, data.metadata);
				}
	}
	/*
	 * Loads and runs a sketch.
	 * @param {string | object} sketchSpec The sketch. If is a string,
	 *        it is assumed to be a a json object, and it is parsed into an
	 *        object. If it is an object, it is assumed to be a sketch object.
	 * @param {string} sketchURL The name of the source of the sketch. Used for
	 *        logging only.
	 * @param {JQuery Object} $target Identifies the DOM location that will be
	 *        replaced by the sketch.
	 * @param {object} options The following properties are supported:
	 *
	 *        onLoad: a function to call after the sketch has been loaded, but 
	 *                before it has been started. Arguments: $target, 
	 *                sketch metadata
	 *        autoStart: we always start the sketch. This boolean controls whether
	 *                or not we immediately pause.
	 *        onReady: a function to call after the sketch has been started. Same
	 *                arguments as above.
	 *        onError: a function to call in the event of error. Arguments:
	 *                target element.
	 *        sketchOptions: an object that is passed to the Sketch constructor.
	 *        delta: a delta generated by SQuery.getSketchDelta() that is to be
	 *                applied to the sketch immediately after loading.
	 */
	function loadSketch(sketchSpec, $target, options) {
			var data;
			
			if (typeof sketchSpec === 'string') {
				try {
					data = $.parseJSON(sketchSpec);
				} catch(e) {
					if (options.onError) {
							options.onError.call($target, sketchSpec);
					}
					e.message = "Load failed: malformed JSON text: " + e.message;
					
					GSP.signalCaughtError(e);
					return;
			 }
			}
			else if (typeof sketchSpec === 'object') {
					data = sketchSpec;
			}
			else {
					if (options.onError) {
							options.onError.call($target, sketchSpec);
					}
					GSP.signalErrorWithMessage("Load failed: unrecognized sketch datatype.");
					return;
			}
			if( options.onLoad) {
				options.onLoad.call($target, data.metadata);
			}
			
			try {
				getGSPInstance(data).then(function(gspInstance) {
					createDocumentFromJSONData(gspInstance, data, $target, options);
					GSP.log("Loaded Sketch: " + options.url || options.varName);     
				});
		 
			} catch(e) {
				 e.message = "Load failed: Exception thrown in startup: " + e.message;
				 GSP.signalCaughtError(e);
		 }
	}
  
  function loadFromScriptUrl($target, options) {
    GSP.log("Loading Sketch: " + options.url);
    var script = document.createElement('script');
    script.src = options.url;
    options.target = $target;
    script.sketchOptions = options;
    script.onload = function(data) {
      // At this point, windows["second"] is the variable containing the sketch.
      var options = this.sketchOptions;
      loadSketch(window[options.varName], options.target, options);
      console.log(data);
    };
    document.body.append(script);
  }

  function isVisible($target) {
    var el, rect, vWidth, vHeight;
    if (!$target.is(":visible")) {
      return false;
    }
    el = $target[0]; 
    rect = el.getBoundingClientRect();
    vWidth = window.innerWidth || document.documentElement.clientWidth;
    vHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.right >= 0 && rect.bottom >= 0 && rect.left <= vWidth && rect.top <= vHeight;
  }

  function loadFromJsonUrl($target, options) {
    var url = options.url;
    GSP.log("Loading Sketch: " + url);
    $.ajax({
        url: options.url,
        success: function (text, statusMsg) {
            if (text) {
              // Need to check visibility again, just in case the sketch_canvas has been hidden
              // With multiple threads, perhaps loadSketch should check this and return true or false.
              if (isVisible ($target)) { // If sketch_canvas is still visible, load it.
                loadSketch(text, $target, options);
              }
              else  { // if sketch_canvas has been hidden, delay it.
                GSP.log ("Load delayed: visibility changed for " + url + ".");
                delayLoadFromUrl ($target, options);
              }
            }
            else {
                GSP.log("Load failed: '%@' is empty", url);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (options.onError) {
                options.onError.call($target, url);
            }
            GSP.log("Load failed: " + textStatus +
                " Error: " + errorThrown.toString());
            // Provide warning in case of local file access and same-origin
            // error. This is a bit ad hoc, since the jqXHR record does not
            // provide sufficient info to diagnose.
            if (url.endsWith(".js")) {
              sendWrongFormatMsg ($target, url);
            } else {
              sendSameOriginQuirkMsg($target);
            }
        },
        dataType: "text"
    });
  }

  function loadNowFromUrl($target, options) {
    if (options.loadFromScript) {
      loadFromScriptUrl($target, options);
    } else {
      loadFromJsonUrl($target, options);
    }
  }

  function delayLoadFromUrl ($target, options) {
    var url = options.url,
        optKey = $target.data ('url') || $target.data ('var');
    if ($target[0].innerHTML === "") {  // If the sketch_canvas has no content, it will never be visible, so add some content.
      $target[0].innerHTML = "Loading...";
    }
    GSP.log("Delaying load of hidden sketch: " + url);
/* jshint ignore:start */  
    if (!fetchFromAttr.observer) {
     fetchFromAttr.observer = new IntersectionObserver (function (entries) {
       entries.forEach(function (entry) {
         var $target = $(entry.target),
             key = $target.data ('url') || $target.data ('var'),
             options = fetchFromAttr.optionsList[key];
          if (entry.isIntersecting && isVisible($target)) {
            loadNowFromUrl($target, options);
            fetchFromAttr.observer.unobserve (entry.target);
            // If not for the chance that two sketches might use the same json, 
            // we could delete fetchFromAttr.optionsList[key];
            // As it is, we ignore the possibility of two sketches, same json, but different options
         }
       });
     });
    }
/* jshint ignore:end */  
    fetchFromAttr.observer.observe ($target[0]);
    fetchFromAttr.optionsList[optKey] = options;
  }


  function loadFromUrl($target, options) {
    // If $target isn't visible, there are problems with sizing the sketch elements,
    // so use IntersectionObserver if it's available.
    // TO DO: figure out how to fix loading a sketch into a hidden element.
    // Even if those bugs are fixed, code should continue using IntersectionObserver,
    // because it allows big pages with hidden sketches to load faster.
    if (isVisible($target) || !useIntObserver) {
      loadNowFromUrl($target, options);
    } else { // $target is hidden, so create an IntersectionObserver
      delayLoadFromUrl($target, options);
    }
  }

	var fetchFromAttr = {
    'observer': null,     // The observer tells us when it's safe to load an originally-hidden sketch.
    'optionsList': {},    // store the options of each delayed-load sketch, keyed by url (for .json) or var (for .js)
	/*
	 * Fetches a requested sketch object from a URL and loads it.
	 * @param {string|Object} sketch The JSON of a sketch document, as a string or JSON object.
	 * @param {JQuery Object} $target Identifies the DOM location that will be
	 *        replaced by the sketch.
	 */
	 'sourceDocument': function(sourceDocument, $target, options) {
			GSP.log("sourceDocument Sketch from JSON document." );
			loadSketch(sourceDocument, $target, options);
		},
	 /*
	 * Fetches a requested sketch object from a URL and loads it.
	 * @param {string} sketchURL The URL of a JSON sketch document.
	 * @param {JQuery Object} $target Identifies the DOM location that will be
	 *        replaced by the sketch.
	 */
	 'url': function(sketchUrl, $target, options) {
      // If $target isn't visible, there are problems with sizing the sketch elements,
      // so use IntersectionObserver if it's available.
      // TO DO: figure out how to fix loading a sketch into a hidden element.
      // Even if those bugs are fixed, code should continue using IntersectionObserver,
      // because it allows big pages with hidden sketches to load faster.
      options.url = sketchUrl;
      if (isVisible($target) || !useIntObserver) {
        loadFromUrl ($target, options);
      } else {  // $target is hidden, so create an IntersectionObserver
        delayLoadFromUrl ($target, options);
      }
    },
    
		/*
		 * Fetches a requested sketch object from a DOM element and loads it.
		 * @param {string} id The DOM id of a DOM element. The text of the 
		 *        element should be a sketch document.
		 * @param {JQuery Object} $target Identifies the DOM location that will be
		 *        replaced by the sketch.
		 */
		'id': function (id, $target, options) {
			loadSketch($("#" + id).html(), $target, options);
		},
		/*
		 * Fetches a requested sketch object from a javascript variable and 
		 * loads it.
		 * @param {string} myVar A variable in the global namespace of a sketch
		 *        document. The text of the value should be a sketch document.
		 * @param {JQuery Object} $target Identifies the DOM location that will be
		 *        replaced by the sketch.
		 */
		'var':  function (myVar, $target, options) {
      var url;
      if (typeof window[myVar] !== "undefined") {
        options.varName = myVar;
        loadSketch(window[myVar], $target, options);
        // We could delete window[myVar] now that it's been loaded
        // Instead we leave it in case the user wants to load it into two sketch_canvas elements
      } else { // myVar is undefined in global namespace, so try to load it from a js file...
        options = options || {};
        options.loadFromScript = true;
        // myVar should be the legal filename of the sketch, possibly preceded by a path.
        url = myVar;
        if (url.endsWith('.js')) { // If url has a suffix, remove it from the variable
          myVar = myVar.replace("-json", "").replace(".js", "");
        } else {
          url = myVar + "-json.js"; // otherwise append -json.js to the url.
        }
        // Strip from from myVar any leading pathname or illegal chars for a variable
        options.varName = GSP.normalizeSketchName(myVar);
        options.url = url;
        // Now data-var="some-sketch.js" has generated the variable name "some_sketch_js" 
        loadFromUrl($target, options);
      }
		},
		/*
		 * Fetches a requested sketch object from another sketch on the same page
		 * and loads it.
		 * @param {string} cloneId The DOM id of a DOM element containing a Sketchpad document.
		 * @param {JQuery Object} $target Identifies the DOM location that will be
		 *        replaced by the sketch.
		 */
		'clone': function (cloneId, $target, options) {
				var docOrSketch = $('#' + cloneId).data('document') ||
							$('#' + cloneId).data('sketch');
				docOrSketch = docOrSketch.sQuery().toString();
				loadSketch(docOrSketch, 'clone', $target, options);
		},
		/*
		 * Fetches a requested sketch object from a promise and loads it.
		 * @param {Object} promise A jquery deferred or promise object.
		 * @param {JQuery Object} $target Identifies the DOM location that will be
		 *        replaced by the sketch.
		 */
		'promise': function (promise, $target, options) {
			promise.done(function(resolved) {
				loadSketch(resolved, 'promise', $target, options);
			}).fail(function(failVal) {
				if (options.onError) {
					options.onError.call($target, failVal);
				}
			});
		}

	};
	
	function fetchSketchFromAttrs(attrElement, sketchElement, options) {
		$.each(fetchFromAttr, function(i, f) {
			var attr = options["data-"+i] || attrElement.data(i);
			if( attr) {
				f(attr, sketchElement, options);
				return false;	// In case there are multiple matches, prefer the first. (It might be better to prefer the first one that succeeds, but these functions don't return a value to indicate success or failure.)
			}
		});
	}


	/**
	 * WSP provides a jQuery plugin interface to the WSP library.
	 * @param {String}  method - the method to call
	 * @param {Object}  options - arguments passed to the specified method
	 */
	$.fn.WSP = function( method, options ) {  

		var config = {
		};
		
		if ( options ) { 
			$.extend( config, options );
		}
	 
		var methods = {
			init : function( options ) { 
			},
			
			/**
			 *  Load the sketch into the DOM element.
			 *  
			 *  @param {object} options A set of (optional) configuration options:
			 *    autostart {boolean}: Start the sketch after load (default true)
			 *                          We might move this to sketchOptions, and have
			 *                          the document start itself.
			 *    sketchOptions {object}: Various document behavior options, passed
			 *                            to the document constructor.
			 *    onLoad {function}: called after successful load.
			 *                        this is the element, metadata is the argument.
			 *                        (default sets element width, height)
			 *    onReady {function}: called when the loaded sketch is ready
			 *    onError {function}: called if an error occurs during the load process
			 *    data-url {string}: if set, an ajax call will be issued to load the sketch
			 *                        from the specified URL.
			 *    delta {string}: JSON delta object generated by getSketchDelta() method.
			 */
			loadSketch : function( options ) {
				
				return this.each(function() { 
					var $this = $(this),
						config = {
							autoStart: true
						};
						
					var docOrSketch = $this.data('document') || $this.data('sketch');
					if (docOrSketch) {
						if (docOrSketch.stop) docOrSketch.stop();
						else if (docOrSketch.stopCurrentFocusedSketch) {
							docOrSketch.stopCurrentFocusedSketch();
						}
						$this.removeData('document');
						$this.removeData('sketch');
					}
					if ( options ) { 
						$.extend( config, options );
					}
					
					fetchSketchFromAttrs($this, $this, config);
				});
			}
		};  
		 
		// Method calling logic
		if ( methods[method] ) {
				return methods[ method ].apply( this, 
						Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
				return methods.init.apply( this, arguments );
		} else {
				$.error( 'Method ' +  method + ' does not exist on jQuery.WSP' );
		}
	};
}( jQuery ));


jQuery(document).ready(function ($) {

		// look for elements of the class "sketch_canvas", find an attribute that 
		// specifies how to instantiate the element, and process accordingly.
		$(".sketch_canvas").WSP("loadSketch");
});
(function() {
		var method;
		var noop = function noop() {};
		var methods = [
				'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
				'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
				'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
				'timeStamp', 'trace', 'warn'
		];
		var length = methods.length;
		var console = (window.console = window.console || {});

		while (length--) {
				method = methods[length];

				// Only stub undefined methods.
				if (!console[method]) {
						console[method] = noop;
				}
		}
}());

