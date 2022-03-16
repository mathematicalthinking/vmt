// Draft idea on how to dynamically load scripts
// TODO: remove jquery files if using package

// import widgetcss from './WSPAssets/widgets/widgets.css'
// import widgetjs from './WSPAssets/widgets/widgets'
// import wsprunner from './WSPAssets/wsp-runner'
// import wsp from './WSPAssets/wsp'

// import { useEffect } from 'react';

const loadExternals = ext => {
    // Do I want to make this into a custom hook?
//   useEffect(() => {
        console.log('Adding: ', ext)
        if (document.getElementById(ext.id)) {
            console.log(ext.id, ' already loaded!')
        } else {
            if (ext.type === 'js') {
                const script = document.createElement('script');
                script.src = ext.file;
                script.id = ext.id;
                script.type="text/javascript";
                // script.charset="utf-8";
                script.onload = () => {
                    console.log('Loaded!: ', ext.id)
                };
                document.body.appendChild(script);

            } else if (ext.type === 'css') {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = ext.file;
                link.id = ext.id;
                link.onload = () => {
                    console.log('Loaded!: ', ext.id)
                };
                document.body.appendChild(link);

            } else {
                console.log('Error loading external: unsupported file type')
    
            }
        }

    // if (callback) callback(loadState);

    // const script = document.createElement('script');
    // script.src = url;
    // script.async = true;
    // document.body.appendChild(script);
    // return () => {
    //   document.body.removeChild(script);
//     };
//   }, [ext]);
};

export default loadExternals;


    