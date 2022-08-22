# Web Sketchpad 

Notes and documentation regarding the Web Sketchpad (WSP) room type integration into VMT done in collaboration and support form McGraw Hill Education (MHE). WSP is a prorpietary suite of code provided under license.

---
## WSP Resources

### WSP Code and Repos:
 - Public MHE Repo: https://github.com/kcpt/kcpt.github.io

 - Demo repo: https://github.com/anzook/21PSTEM-WSP-Test

### WSP Docs, code, and examples
#### Web Sketchpad Technical Site:
WSP technical docs and info
 - https://wsp.kcptech.com/
 #### Sketchpad Reference:
 WSP about and usage detailed docs
 - https://referencecenter.dynamicgeometry.com/
 #### Geometric Tool Function Library:
 Contains a WSP testbed that demonstrated all of the available tools and widgets, as well as allows upload and download of sketch files
 - https://geometricfunctions.org/fc/tools/library/?debug=true


---
## VMT Integration

### Loading and Starting
WSP sketches can be loaded either automatically through WSP picking up a DOM element with the class name "sketch_canvas", or through jQuery and the WSP runner plugin. VMT currently uses the jQuery approach with javascript to dynamically append the sketch to the page when called. In order to accomplish this in VMT, the requisite scripts must be running on the page and does so with a simple helper to load these as needed. Since VMT does not natively require jQuery, this will be the first script to load. As there is a depedancy of jQuery -> WSP -> WSP-Runner (the plugin), these scripts are loaded sequentially via callbacks once loaded. 

In order for these scripts to point to valid code on the client, the WSP assests are stored in '/public/WSPAssets/*'. The jsconfig.json is configured to include these files in the final build. 

