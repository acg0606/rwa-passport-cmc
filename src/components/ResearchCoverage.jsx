import {ArrowRight,FileText} from '@phosphor-icons/react';
import {passports,hasResearch} from '../data/research.js';

export default function ResearchCoverage({rows,onSelect,selectedId}) {
  const covered=rows.filter(hasResearch).length,partial=rows.filter(asset=>asset.research?.status==='PARTIAL').length;
  return <section className="research-coverage" aria-labelledby="research-coverage-heading">
    <div><span className="research-eyebrow"><FileText/> Research library</span><h2 id="research-coverage-heading">Start with a source-linked passport.</h2><p>{passports.length} dossiers available. {rows.length?`${covered} of the ${rows.length} displayed CMC entries have research. Market data only: ${rows.length-covered}. ${partial?`Partially documented: ${partial}. `:''}`:'Market ranking is loading or unavailable; these dossiers remain accessible.'} Source coverage does not mean independent verification of backing.</p></div>
    <div className="research-library-controls"><label htmlFor="dossier-select">Open any dossier</label><select id="dossier-select" aria-label="Open a research dossier" value={passports.some(p=>p.id===selectedId)?selectedId:''} onChange={e=>onSelect(Number(e.target.value))}><option value="" disabled>Select a researched asset</option>{passports.map(asset=><option key={asset.id} value={asset.id}>{asset.symbol} · {asset.category}{asset.research?.status==='PARTIAL'?' · partial':''}</option>)}</select><div className="research-shortcuts" aria-label="Open a researched passport">{passports.slice(0,3).map(asset=><button key={asset.id} onClick={()=>onSelect(asset.id)}><FileText/><span><strong>{asset.symbol}</strong><small>{asset.category}</small></span><ArrowRight/></button>)}</div></div>
  </section>;
}

export function ResearchPending({asset,onSelect}) {
  return <div className="research-pending"><span className="status-chip">Market data only</span><h3>This passport needs research.</h3><p>CMC provides the {asset.symbol} market listing. We have not yet reviewed this asset’s issuer, reference asset, legal rights or custody. No locations or backing claims are shown.</p><p className="fine-print">This describes our research coverage, not whether the asset has backing.</p><button className="text-action" onClick={()=>onSelect(4705)}>Explore the PAXG dossier <ArrowRight/></button></div>;
}
