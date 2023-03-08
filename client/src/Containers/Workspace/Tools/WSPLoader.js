// Helper to load static scripts/files needed for WSP elements
// Manually cascading the imports to control order for dependency

// callback is called when critical scipts are loaded and sketch can be loaded

export const WSPLoader = (callback) => {
  const loadJquery = () => {
    // check for jQuery
    if (window.jQuery) {
      console.log('jQuery found');
      loadWSP();
    } else {
      const script = document.createElement('script');
      script.src = '/WSPAssets/jquery-2.1.0.min.js';
      script.id = 'jquery';
      script.type = 'text/javascript';
      // script.async = false; // either set async false or control load order
      script.onload = () => {
        console.log('Loaded jQuery... ');
        // Now GSP may be loaded
        loadWSP();
      };
      document.body.appendChild(script);
    }
  };

  const loadWSP = () => {
    if (document.getElementById('wspscript')) {
      console.log('WSP found');
      loadWSPRunner();
    } else {
      const script = document.createElement('script');
      script.src = '/WSPAssets/wsp.js';
      script.id = 'wspscript';
      script.type = 'text/javascript';
      // script.async = false; // either set async false or control load order
      // script.charset="utf-8";  // redundant
      script.onload = () => {
        console.log('Loaded WSP... ');
        // The plugin runner can now be added
        loadWSPRunner();
      };
      document.body.appendChild(script);
    }
  };

  const loadWSPRunner = () => {
    if (document.getElementById('wsprunner')) {
      console.log('WSP-Runner found');
      loadWidgets();
    } else {
      const script = document.createElement('script');
      script.src = '/WSPAssets/wsp-runner.js';
      script.id = 'wsprunner';
      script.type = 'text/javascript';
      script.onload = () => {
        console.log('Loaded WSP-Runner... ');
        loadWidgets();
      };
      document.body.appendChild(script);
    }
  };

  const loadWidgets = () => {
    if (
      document.getElementById('widgetsjs') &&
      document.getElementById('widgetscss') &&
      document.getElementById('tiny-draggable')
    ) {
      console.log('Reloadin Widgets!');
      if (document.getElementById('widgetsjs')) {
        document.getElementById('widgetsjs').remove();
      }
      if (document.getElementById('tiny-draggable')) {
        document.getElementById('tiny-draggable').remove();
      }
      if (document.getElementById('widgetscss')) {
        document.getElementById('widgetscss').remove();
      }
    }
    const script1 = document.createElement('script');
    script1.src = '/WSPAssets/widgets/jquery.tiny-draggable.js';
    script1.id = 'tiny-draggable';
    script1.type = 'text/javascript';
    script1.onload = () => {
      const script = document.createElement('script');
      script.src = '/WSPAssets/widgets/widgets.js';
      script.id = 'widgetsjs';
      script.type = 'text/javascript';
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = '/WSPAssets/widgets/widgets.css';
      link.id = 'widgetscss';
      link.onload = () => {
        console.log('Loaded Widgets...');
        // loadTools();
        // finally load the widgets and fire the ready callback
        console.log('Core WSP assets loaded: Ready to create script!');
        callback();
      };
      document.body.appendChild(script);
      document.body.appendChild(link);
    };
    document.body.appendChild(script1);
  };

  // initiate load sequence
  loadJquery();
};

export const loadTools = () => {
  if (document.getElementById('wsptools')) {
    console.log('tools.js found - skipping');
    // document.getElementById('wsptools').remove();
  } else {
    const script = document.createElement('script');
    script.src = '/WSPAssets/tools.js';
    script.id = 'wsptools';
    script.type = 'text/javascript';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '/WSPAssets/tools.css';
    link.id = 'toolscss';
    script.onload = () => {
      console.log('Loaded tools.js... ');
      console.log('Window status: ', window.TOOLS, window);
      // console.log('Core WSP assets loaded: Ready to create script!');
    };
    document.body.appendChild(script);
    document.body.appendChild(link);
  }
};

export default {
  WSPLoader,
  loadTools,
};

// Alternate jQuery option from CDN
//     <Script
// url="https://code.jquery.com/jquery-2.2.4.min.js"
// integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
// crossorigin="anonymous"
// onLoad={() => {
//    console.log("jQuery loaded!")
// }
// }
// />
