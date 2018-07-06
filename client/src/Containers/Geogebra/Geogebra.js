import React, { Component } from 'react';

class Geogebra extends Component {
  componentDidMount() {
    const script = document.createElement('script');
    script.src = '/client/public/js/ggbClient.js'
    console.log(script.src)
    script.async = true;
    document.body.appendChild(script);
  }

  render () {
    return (
      <div>
        <article className="geogebraweb" data-param-width="700" data-param-height="600" data-param-useBrowserForJS="true" data-param-showToolBar="true" data-param-showMenuBar="true"
        data-param-ggbbase64="{{tabFile}}">
        </article>
        <input type="hidden" id="roomId" value="{{roomIdValue}}" />
        <input type="hidden" id="username" value="{{username}}" />
        <input type="hidden" id="tabId" value="{{tabId}}" />
        <input type="hidden" id="host" value="{{hostValue}}" />
        <input type="hidden" id="port" value="{{portValue}}" />
        <div id="ggbLoadingOverlay">
          <h1> Loading Geogebra, this may take a few moments....</h1>
        </div>
      </div>

    )
  }
}

export default Geogebra;
