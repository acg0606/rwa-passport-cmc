import {useMemo,useState} from 'react';
import {ArrowSquareOut,Graph,MapPin,FileText} from '@phosphor-icons/react';
import {Chart} from './Chart.jsx';
import {atlasPalette as palette,atlasUiFont} from '../lib/atlas-theme.js';

export default function Structure({asset,onLocate,reducedMotion}) {
  const [active,setActive]=useState('token');
  const location=asset.custody||asset.origin;
  const nodes=useMemo(()=>[
    {id:'issuer',name:asset.issuer,x:50,y:125,kind:'Issuer',description:'The entity behind the token or instrument. Its role is based on the linked source.',url:asset.sources[0]?.url},
    {id:'token',name:asset.symbol,x:340,y:125,kind:'Token',description:asset.legalLink,url:asset.sources[0]?.url},
    {id:'reference',name:asset.reference,x:610,y:125,kind:'Reference asset',description:asset.family==='gold'?'Gold is the reference commodity. Global production statistics do not identify the source of a particular token’s reserves.':asset.legalLink,url:asset.sources[0]?.url},
    {id:'place',name:location?.name||'Location unknown',x:610,y:320,kind:asset.custody?'Declared custody':'Corporate context',description:location?.statement||'No geographic evidence has been researched for this token.',url:location?.source},
    {id:'source',name:'Official evidence',x:340,y:320,kind:'Source',description:'Follow the documents and inspect what they actually support. A linked source is not a guarantee of backing.',url:asset.sources[0]?.url},
    {id:'markets',name:'Token markets',x:50,y:320,kind:'Market directory',description:'Market listings describe venues, not the location of the physical asset or every buyer.',url:asset.slug?`https://coinmarketcap.com/currencies/${asset.slug}/#Markets`:null},
  ],[asset]);
  const researched=asset.sources.length>0;
  const links=[{source:'issuer',target:'token',name:researched?'issuer statement':'not researched'},{source:'token',target:'reference',name:researched?'references':'not researched'},{source:'reference',target:'place',name:location?(asset.custody?'declared custody':'company context'):'unknown location'},{source:'source',target:'token',name:researched?'documents':'evidence needed'},{source:'source',target:'place',name:location?'location statement':'evidence needed'},{source:'token',target:'markets',name:asset.slug?'directory':'not researched'}];
  const option=useMemo(()=>({animation:!reducedMotion,aria:{enabled:true},tooltip:{show:false},series:[{type:'graph',layout:'none',roam:false,left:90,right:95,top:85,bottom:75,data:nodes.map(n=>({...n,symbol:'roundRect',symbolSize:n.id==='token'?[150,76]:n.id==='source'?[128,64]:[172,64],itemStyle:{color:n.id===active?palette.tealWash:palette.panel,borderColor:n.id===active?palette.ink:'#91a594',borderWidth:1.5,shadowColor:'#becab966',shadowBlur:0,shadowOffsetX:3,shadowOffsetY:3},label:{show:true,color:palette.ink,fontFamily:'Georgia, serif',fontWeight:n.id==='token'?700:400,fontSize:n.id==='token'?22:14}})),links:links.map(l=>({...l,label:{show:true,formatter:l.name,opacity:1,color:palette.muted,fontFamily:atlasUiFont,fontSize:11}})),edgeSymbol:['none','arrow'],edgeSymbolSize:7,lineStyle:{color:'#638c86',opacity:1,width:1.5,curveness:.015},emphasis:{focus:'adjacency'}}]}),[nodes,active,reducedMotion]);
  const selected=nodes.find(n=>n.id===active)||nodes[1];
  return <section className="structure-section" aria-labelledby="structure-heading">
    <div className="section-heading"><div><h2 id="structure-heading">Understand the connection.</h2><p>Every relationship has a meaning. Every claim needs a source.</p></div><span className="status-chip"><Graph size={15}/> Evidence graph</span></div>
    <p className="graph-hint">On a narrow screen, scroll the diagram sideways. All nodes can also be selected below.</p>
    <div className="structure-layout"><div className="graph-wrap"><Chart option={option} onSelect={p=>p.dataType==='node'&&setActive(p.data.id)} label={`Relationship graph for ${asset.symbol}. ${researched?'Issuer, reference asset and locations are attributed to linked documents.':'Asset-specific relationships have not been researched.'} Use the node buttons to inspect each relationship.`}/>
      <div className="graph-keyboard" aria-label="Select a relationship node">{nodes.map(node=><button key={node.id} className={active===node.id?'selected':''} onClick={()=>setActive(node.id)}>{node.kind}</button>)}</div>
    </div><aside className="graph-explanation"><h3>{selected.name}</h3><span className="status-chip">{selected.kind}</span><p>{selected.description}</p>{selected.url&&<a href={selected.url} target="_blank" rel="noreferrer">Read the source <ArrowSquareOut/></a>}{location&&active==='place'&&<button className="text-action" onClick={()=>onLocate(location.id)}><MapPin/> Locate on the globe</button>}<div className="quiet-note"><FileText size={18}/>{researched?'An attributed relationship, not an independent backing audit. Read the linked document for its scope and date.':'UNKNOWN: no asset-specific research is loaded. Category membership does not establish backing, an issuer relationship or a location.'}</div></aside></div>
  </section>;
}
