// One SDK download for Radar and event location maps.
(()=>{let pending;window.noodoLoadMapbox=()=>{
 if(window.mapboxgl)return Promise.resolve();
 if(pending)return pending;
 pending=new Promise((resolve,reject)=>{
  const css=document.createElement('link'),script=document.createElement('script');
  css.rel='stylesheet';css.href='https://api.mapbox.com/mapbox-gl-js/v3.35.0/mapbox-gl.css';
  script.src='https://api.mapbox.com/mapbox-gl-js/v3.35.0/mapbox-gl.js';script.async=true;
  const timer=setTimeout(fail,20000);
  function fail(){clearTimeout(timer);script.remove();css.remove();pending=null;reject(new Error('Mapbox unavailable'));}
  script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=fail;document.head.append(css,script);
 });return pending;
};})();
