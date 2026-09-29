import { useEffect,useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart,GraphChart,LineChart } from 'echarts/charts';
import { GridComponent,TooltipComponent,TitleComponent,AriaComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([BarChart,GraphChart,LineChart,GridComponent,TooltipComponent,TitleComponent,AriaComponent,CanvasRenderer]);

export function Chart({option,onSelect,className='',label}) {
  const element=useRef(null), chart=useRef(null), callback=useRef(onSelect);
  callback.current=onSelect;
  useEffect(()=>{
    const instance=echarts.init(element.current,null,{renderer:'canvas'});chart.current=instance;
    const observer=new ResizeObserver(()=>instance.resize());observer.observe(element.current);
    instance.on('click',params=>callback.current?.(params));
    return ()=>{observer.disconnect();instance.dispose();chart.current=null;};
  },[]);
  useEffect(()=>{chart.current?.setOption({...option,aria:{enabled:true,description:label}});},[option,label]);
  return <div ref={element} className={`chart ${className}`} role="img" aria-label={label}/>;
}
