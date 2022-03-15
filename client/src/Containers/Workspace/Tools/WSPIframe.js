import React, { useState } from 'react'
import { createPortal } from 'react-dom'

const CustomIframe = ({
  children,
  ...props
}) => {
  const [contentRef, setContentRef] = useState(null)

  const mountNode = ( contentRef && contentRef.contentWindow && contentRef.contentWindow.document && contentRef.contentWindow.document.body) ?
    contentRef.contentWindow.document.body : null;

  return (
    <iframe {...props} ref={setContentRef}>
        <html>
  <head>
    <script
      charSet="utf-8"
      type="text/javascript"
      src="./WSPAssets/jquery-2.1.0.min.js"
    ></script>
    <script
      charSet="utf-8"
      type="text/javascript"
      src="./WSPAssets/wsp.js"
    ></script>
    <script src="./includes/widgets/jquery.tiny-draggable.js"></script>
    <link
      rel="stylesheet"
      type="text/css"
      href="./WSPAssets/widgets/widgets.css"
    />
    <script
      charSet="utf-8"
      type="text/javascript"
      src="./WSPAssets/wsp-runner.js"
    ></script>
    <script src="./WSPAssets/widgets/widgets.js"></script>
    {/* <script type="module" src="./follow.js"></script> */}
  </head>
  <body>
    {/* <div class="sketch_container">
      <div class="sketch_canvas" id="sketch2" data-url="./test.json">
        Loading...
      </div>
      <div class="buttonPane">
      </div>
    </div> */}
          {mountNode && createPortal(children, mountNode)}

  </body>
</html>
    </iframe>
  )
}

export default CustomIframe;