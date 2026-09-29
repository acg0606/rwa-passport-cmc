import {ArrowRight,ArrowSquareOut,Compass,Graph,ClockCounterClockwise} from '@phosphor-icons/react';

const chapters=[
  {id:'world',number:'01',title:'Find its place',detail:'Explore the geographic context',Icon:Compass},
  {id:'structure',number:'02',title:'Follow the evidence',detail:'Trace the claim to its source',Icon:Graph},
  {id:'history',number:'03',title:'Read its history',detail:'See what changes over time',Icon:ClockCounterClockwise},
];

export default function AtlasCover({onNavigate}) {
  return <section id="cover" className="atlas-cover" aria-labelledby="cover-title">
    <div className="cover-layout">
      <div className="cover-copy">
        <p className="cover-eyebrow">A field guide to real-world assets</p>
        <h1 id="cover-title">RWA<br/>PASSPORT</h1>
        <p className="cover-subtitle">The evidence behind<br/>tokenized assets.</p>
        <p className="cover-description">Travel from a market ticker to the asset, the places and the documents behind it.</p>
        <div className="cover-actions">
          <button className="atlas-primary" onClick={()=>onNavigate('world')}>Explore the atlas <ArrowRight size={19}/></button>
          <a className="cover-demo" href="/demo.html">Watch the demo <ArrowSquareOut size={15}/></a>
        </div>
        <p className="cover-footnote">CMC market data · Source-linked research</p>
      </div>
      <figure className="cover-art">
        <img src="/assets/atlas-landscape-v2.png" width="1536" height="1024" fetchPriority="high" alt="An illustrated cartographer studies an atlas above a pastel valley, with distant observatories and mineral cliffs."/>
        <figcaption>Imagine the journey. Inspect the evidence.</figcaption>
      </figure>
    </div>
    <nav className="atlas-chapters" aria-label="Explore the atlas">
      {chapters.map(({id,number,title,detail,Icon})=><button key={id} onClick={()=>onNavigate(id)}><span className="chapter-number">{number}</span><Icon size={29} weight="thin"/><span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size={19}/></button>)}
    </nav>
  </section>;
}
