import React from 'react';

const workspace = (props) => {

  return (
    <div className='container-fluid'>
      <div className='row'>
        <div className='col-md-9 nopadding-sides'>
          <div class='ui-tabs ui-widget-content ui-corner-all'>
            <ul class='ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-wdget-header ui-cornern-all'>
              <li className=''></li>
            </ul>
            <iframe
              height={400}
              width={600}
              title={props.roomName}
              id={`fragment-${props.roomName}`}
              src={`/Geogebra.html`}>
            </iframe>
          </div>
        </div>
      </div>
      <div className='row'></div>
      <div className='row hidden'></div>
    </div>
  )

}

export default workspace;
