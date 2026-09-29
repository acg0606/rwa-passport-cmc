import {useMemo,useState} from 'react';
import {ArrowSquareOut,FileText,Graph,Table} from '@phosphor-icons/react';
import {Chart} from './Chart.jsx';
import {buildEvidenceGraph,evidenceLabels} from '../lib/evidence-graph.js';
import {atlasPalette as palette,atlasUiFont} from '../lib/atlas-theme.js';

export default function EvidenceDossier({asset,reducedMotion}) {
  const [active,setActive]=useState('reference'),[view,setView]=useState('graph');
  const {nodes,links}=useMemo(()=>buildEvidenceGraph(asset),[asset]);
  const selected=nodes.find(node=>node.id===active)||nodes[0];
  const option=useMemo(()=>({animation:!reducedMotion,tooltip:{show:false},series:[{
    type:'graph',layout:'none',roam:false,left:112,right:112,top:70,bottom:70,
    data:nodes.map(node=>({...node,symbol:'roundRect',symbolSize:[180,node.id==='instrument'?86:76],
      itemStyle:{color:node.id===active?palette.tealWash:palette.panel,borderColor:node.status==='PARTIAL'?palette.gold:node.id===active?palette.ink:'#91a594',borderWidth:1.5,borderType:node.status==='PARTIAL'?'dashed':'solid',shadowColor:'#becab966',shadowOffsetX:3,shadowOffsetY:3},
      label:{show:true,color:palette.ink,fontFamily:'Georgia, serif',fontSize:node.id==='instrument'?17:14,lineHeight:20},
    })),links:links.map(link=>({...link,lineStyle:{type:link.status==='PARTIAL'?'dashed':'solid',color:link.status==='PARTIAL'?palette.gold:'#638c86'},label:{show:true,formatter:link.name,color:palette.muted,fontFamily:atlasUiFont,fontSize:10}})),
    edgeSymbol:['none','arrow'],edgeSymbolSize:7,lineStyle:{width:1.5,opacity:1,curveness:.025},emphasis:{focus:'adjacency'},
  }]}),[nodes,links,active,reducedMotion]);
  return <section className="structure-section evidence-dossier" aria-labelledby="structure-heading">
    <div className="section-heading"><div><h2 id="structure-heading">The link to the real asset.</h2><p>{asset.research.summary}</p></div><div className="segmented" aria-label="Research view"><button aria-pressed={view==='graph'} onClick={()=>setView('graph')}><Graph/> Evidence graph</button><button aria-pressed={view==='matrix'} onClick={()=>setView('matrix')}><Table/> Evidence matrix</button></div></div>
    <div className="dossier-meta"><span className={`status-chip ${asset.research.status==='PARTIAL'?'partial-evidence':''}`}>{asset.research.status==='PARTIAL'?'Partially documented':'Source-linked dossier'}</span><span>Reviewed {asset.research.reviewedAt}</span>{asset.isin&&<span>Instrument ISIN {asset.isin}</span>}</div>
    {view==='graph'?<div className="structure-layout"><div className="graph-wrap dossier-graph"><Chart option={option} onSelect={params=>{if(params.dataType==='node')setActive(params.data.id);if(params.dataType==='edge')setActive(params.data.claimId);}} label={`Evidence graph for ${asset.symbol}: issuer or platform, token instrument, reference asset, disclosed backing, named custody and holder rights. Select a node or arrow to inspect its source. Dashed connections mean partial evidence.`}/><div className="graph-keyboard" aria-label="Select an evidence claim">{nodes.map(node=><button key={node.id} aria-pressed={active===node.id} className={active===node.id?'selected':''} onClick={()=>setActive(node.id)}>{node.label}</button>)}</div><p className="dossier-graph-note">Arrows describe sourced product relationships, not a live reserve audit. Dashed lines mark partial evidence. Use the buttons or scroll the diagram on small screens.</p></div>
      <aside className="graph-explanation" aria-live="polite"><span className="research-eyebrow">{selected.label}</span><h3>{selected.value}</h3><span className={`status-chip ${selected.status==='PARTIAL'?'partial-evidence':''}`}>{evidenceLabels[selected.status]}</span><p>{selected.detail}</p>{selected.evidence&&<div className="claim-source"><a href={selected.evidence.url} target="_blank" rel="noreferrer"><FileText/> {selected.evidence.label} <ArrowSquareOut/></a><p>{selected.evidence.publisher}</p><p>Document date: {selected.evidence.publishedAt||'Not stated'}<br/>Section: {selected.section}<br/>Reviewed: {selected.evidence.reviewedAt}</p></div>}</aside></div>:
      <div className="table-scroll evidence-matrix"><table><caption>{asset.symbol}: claims, evidence class and source</caption><thead><tr><th scope="col">Relationship</th><th scope="col">What the evidence supports</th><th scope="col">Evidence</th></tr></thead><tbody>{nodes.map(node=><tr key={node.id}><th scope="row">{node.label}</th><td><strong>{node.value}</strong><p>{node.detail}</p></td><td><span className={`status-chip ${node.status==='PARTIAL'?'partial-evidence':''}`}>{evidenceLabels[node.status]}</span>{node.evidence&&<><a href={node.evidence.url} target="_blank" rel="noreferrer">{node.evidence.label} <ArrowSquareOut/></a><small>{node.evidence.publishedAt||'Document date not stated'} · {node.section}</small></>}</td></tr>)}</tbody></table></div>}
    <details className="dossier-gaps"><summary>{asset.research.gaps.length} research limits and open points</summary><ul>{asset.research.gaps.map(gap=><li key={gap}>{gap}</li>)}</ul></details><div className="research-downloads"><a href="/research/matrix.csv" download>Download the 8-asset comparison</a><a href="/research/passports.json" target="_blank" rel="noreferrer">Read the research ledger <ArrowSquareOut/></a></div>
  </section>;
}
