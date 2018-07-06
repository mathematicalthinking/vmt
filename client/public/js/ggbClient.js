var ggbApp = new GGBApplet({"appName": "graphing", "width": 800, "height": 600, "showToolBar": true, "showAlgebraInput": true, "showMenuBar": true }, true);
  window.addEventListener("load", function() {
    console.log("adding listner")
    ggbApp.inject('ggb-element');
    console.log(ggbApp);
});
