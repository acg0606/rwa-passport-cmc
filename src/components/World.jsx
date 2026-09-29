import { useEffect,useRef,useState,useMemo } from 'react';
import Globe from 'react-globe.gl';
import {MeshPhongMaterial} from 'three';
import {atlasPalette as palette} from '../lib/atlas-theme.js';
import { GlobeHemisphereWest,Minus,Plus,Crosshair,ArrowClockwise } from '@phosphor-icons/react';

export default function World({context,selected,onSelect,trade,focusRequest,reducedMotion}) {
  const globe=useRef(),wrapper=useRef(),[size,setSize]=useState({width:800,height:700}),[geo,setGeo]=useState([]),[failed,setFailed]=useState(false),[ready,setReady]=useState(false),[orbit,setOrbit]=useState(false);
  const material=useMemo(()=>new MeshPhongMaterial({color:palette.ocean}),[]);
  useEffect(()=>()=>material.dispose(),[material]);
  useEffect(()=>{
    const observer=new ResizeObserver(([entry])=>setSize({width:entry.contentRect.width,height:entry.contentRect.height}));
    observer.observe(wrapper.current);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{let alive=true;fetch('/data/countries.geojson').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{if(alive)setGeo(data.features);}).catch(()=>setFailed(true));return()=>{alive=false;};},[]);
  const points=context.points;
  const findPoint=feature=>points.find(p=>p.id===(feature.properties.ADM0_A3||feature.properties.ISO_A3)&&(context.kind!=='qualitative'||p.precision==='Country only'));
  const selectedPoint=points.find(p=>p.id===selected);
  const target=selectedPoint||points[0];
  function focus(point=target){if(point&&globe.current)globe.current.pointOfView({lat:point.lat,lng:point.lng,altitude:context.kind==='qualitative'?1.55:2.05},reducedMotion?0:1100);}
  useEffect(()=>{if(ready)focus();},[focusRequest,selected,ready]);
  useEffect(()=>{if(globe.current&&ready){globe.current.controls().autoRotate=orbit&&!reducedMotion;globe.current.controls().autoRotateSpeed=.3;}},[orbit,reducedMotion,ready]);
  const arcs=useMemo(()=>context.kind==='trade'?points.map(p=>({startLat:p.lat,startLng:p.lng,endLat:trade.destination.lat,endLng:trade.destination.lng,...p})):[],[context,trade]);
  const capColor=feature=>{
    const point=findPoint(feature);
    if(!point)return 'rgba(86,132,137,0.96)';
    if(point.id===selected)return 'rgba(226,185,110,0.98)';
    return `rgba(218,167,64,${context.kind==='qualitative'?.32:Math.min(.72,.18+(point.share??point.value/3)/22)})`;
  };
  const labels=points.filter(p=>p.id===selected||context.kind==='qualitative');
  return <div className="world" ref={wrapper}>
    {!failed && <Globe ref={globe} width={size.width} height={size.height} backgroundColor="#f2eddf"
      globeMaterial={material} showAtmosphere atmosphereColor="#becfc4" atmosphereAltitude={.035}
      polygonsData={geo} polygonAltitude={feature=>findPoint(feature)?.id===selected ? .009 : .003}
      polygonCapColor={capColor} polygonSideColor={()=>'rgba(239,193,83,0.18)'} polygonStrokeColor={feature=>findPoint(feature)?'#ddb964':'rgba(206,223,208,.34)'}
      polygonLabel={feature=>{const p=findPoint(feature);return p?`${p.name}: ${p.value==null?'declared location, not a stock quantity':`${p.value.toLocaleString('en-US')} ${context.unit}`}`:`${feature.properties.ADMIN}: no data in this layer`;}}
      onPolygonClick={feature=>{const point=findPoint(feature);if(point)onSelect(point.id);}}
      pointsData={points} pointLat="lat" pointLng="lng" pointAltitude={.016} pointRadius={p=>p.id===selected ? .42 : .2} pointColor={()=>'#f6d58a'} onPointClick={p=>onSelect(p.id)}
      labelsData={labels} labelLat="lat" labelLng="lng" labelText={p=>p.name} labelColor={()=>'#fff1c9'} labelSize={1.15} labelDotRadius={.2} labelAltitude={.03} labelResolution={2}
      arcsData={arcs} arcColor={()=>['#7bc6d4','#e9c05b']} arcStroke={.35} arcDashLength={.6} arcDashGap={.22} arcDashAnimateTime={0} arcLabel={p=>`${p.name} → United States: ${p.value}% of U.S. gold imports (2021–2024). Schematic, not a shipping route.`}
      onGlobeReady={()=>{if(!globe.current)return;setReady(true);globe.current.pointOfView({lat:24,lng:5,altitude:2.12},0);globe.current.controls().enablePan=false;globe.current.controls().minDistance=135;globe.current.controls().maxDistance=450;}}
      animateIn={false}
    />}
    {failed&&<div className="world-fallback"><GlobeHemisphereWest size={64}/><h2>Map unavailable</h2><p>The location list and evidence remain available below.</p></div>}
    {!ready&&!failed&&<div className="world-loading">Preparing the geographic atlas…</div>}
    <div className="map-tools" aria-label="Map controls">
      <button aria-label="Zoom in" onClick={()=>{const p=globe.current?.pointOfView();if(p)globe.current.pointOfView({...p,altitude:Math.max(.5,p.altitude*.8)},300);}}><Plus/></button>
      <button aria-label="Zoom out" onClick={()=>{const p=globe.current?.pointOfView();if(p)globe.current.pointOfView({...p,altitude:Math.min(3.5,p.altitude*1.2)},300);}}><Minus/></button>
      <button aria-label="Focus selected location" onClick={()=>focus()}><Crosshair/></button>
      <button aria-label={orbit?'Stop globe rotation':'Rotate globe'} aria-pressed={orbit} onClick={()=>setOrbit(v=>!v)} disabled={reducedMotion}><ArrowClockwise/></button>
    </div>
    <span className="map-instruction">Drag to explore · select a highlighted region</span>
    <span className="map-attribution">Natural Earth · static basemap · borders are contextual</span>
  </div>;
}
