const positions={issuer:[50,90],instrument:[340,90],reference:[630,90],custody:[340,325],backing:[630,325],rights:[50,325]};
export const evidenceLabels={DOCUMENTED_TERMS:'Documented terms',ISSUER_STATEMENT:'Published claim',PARTIAL:'Partial evidence',UNKNOWN:'Unresolved'};

export function buildEvidenceGraph(asset) {
  if(!asset.research?.facets) return {nodes:[],links:[]};
  const facets=asset.research.facets;
  const nodes=Object.entries(positions).map(([id,[x,y]])=>({
    ...facets[id],id,x,y,name:id==='instrument'?`${asset.symbol}\n${facets[id].shortLabel}`:facets[id].shortLabel,
    evidence:asset.sources.find(s=>s.id===facets[id].sourceId),
  }));
  const cash=asset.family==='cash';
  const links=[
    {source:'issuer',target:'instrument',name:asset.research.issuerEdge||'issues',claimId:'issuer'},
    {source:'instrument',target:'reference',name:cash?'denominated in':'tracks',claimId:'reference'},
    {source:'reference',target:'backing',name:cash?'stated reserve':'specified collateral',claimId:'backing'},
    {source:'custody',target:'backing',name:cash?'account described':'custody arrangement',claimId:'custody'},
    {source:'backing',target:'instrument',name:cash?'stated backing':'backs under terms',claimId:'backing'},
    {source:'instrument',target:'rights',name:cash?'conversion mechanism':'holder rights',claimId:'rights'},
  ].map(link=>({...link,status:facets[link.claimId].status,sourceId:facets[link.claimId].sourceId}));
  return {nodes,links};
}
