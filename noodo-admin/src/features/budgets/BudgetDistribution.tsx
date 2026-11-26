import type {Budget,BudgetCategory} from '../../data/types';
import {budgetGroupMetrics,budgetTrend} from '../../data/budget-views';
import {categoryMetrics} from '../../data/budgets';
import {money,today,dateLabel} from '../../lib/format';
import {SectionHeader,EmptyState} from '../../components/ui';
import {DataTable} from '../../components/ui/DataTable';

export function BudgetDistribution({budget,categories}:{budget:Budget;categories:BudgetCategory[]}){
 const subset={...budget,categories};
 const groups=[...budget.categoryGroups.filter(g=>!g.deletedAt).map(g=>({id:g.id,name:g.name,...budgetGroupMetrics(subset,g.id)})),{id:'none',name:'Sin grupo',...budgetGroupMetrics(subset)}].filter(g=>g.count>0);
 const max=Math.max(1,...groups.map(g=>g.allocated));
 const trend=budgetTrend(budget,today(),categories.map(c=>c.id));const peak=Math.max(1,...trend.map(day=>day.total));
 return <div className="budget-distribution">
 <section className="panel panel-padded"><SectionHeader title="Presupuesto por grupo"/><p className="meta">Asignaciones de las categorías incluidas en esta vista.</p>
 {groups.length?groups.map(g=><div className="budget-group-bar" key={g.id}><div><strong>{g.name}</strong><span>{money(g.allocated)}</span></div><meter min={0} max={max} value={g.allocated} aria-label={`Asignado a ${g.name}`}/></div>):<EmptyState title="Sin asignaciones para mostrar"/>}</section>
 <section className="panel panel-padded"><SectionHeader title="Tendencia de gastos · 30 días"/><p className="meta">Gastos reales y proyectados por fecha. Los anulados se excluyen.</p>
 <svg className="budget-trend" viewBox="0 0 600 180" role="img" aria-label={`Tendencia del ${dateLabel(trend[0].date)} al ${dateLabel(trend[29].date)}. Consulta los importes en Detalle por día.`}>
 <line x1="10" y1="160" x2="590" y2="160" className="budget-chart-axis"/>
 <polyline points={trend.map((day,i)=>`${10+i*20},${160-day.total/peak*140}`).join(' ')} className="budget-chart-line"/>
 {trend.map((day,i)=><circle key={day.date} cx={10+i*20} cy={160-day.total/peak*140} r="3" className="budget-chart-point"><title>{dateLabel(day.date)}: {money(day.total)}</title></circle>)}
 </svg><div className="budget-chart-labels"><span>{dateLabel(trend[0].date)}</span><span>Máximo: {money(peak===1&&!trend.some(d=>d.total)?0:peak)}</span><span>{dateLabel(trend[29].date)}</span></div>
 <details className="space-top"><summary>Detalle por día</summary><DataTable rows={[...trend].reverse()} columns={[{key:'date',title:'Fecha',render:d=>dateLabel(d.date),sortValue:d=>d.date},{key:'actual',title:'Real',render:d=>money(d.actual),sortValue:d=>d.actual},{key:'projected',title:'Proyectado',render:d=>money(d.projected),sortValue:d=>d.projected},{key:'total',title:'Total',render:d=>money(d.total),sortValue:d=>d.total}]}/></details></section>
 <section className="panel panel-padded"><SectionHeader title="Asignación y ejecución por categoría"/>{categories.map(c=>{const s=categoryMetrics(budget,c.id);return <div className="budget-chart-row" key={c.id}><strong>{c.name}</strong><progress value={Math.min(100,s.percentage)} max={100} aria-label={`Ejecución de ${c.name}`}/><span>{money(s.committed)} / {money(s.allocated)}<small className="meta">{Math.round(s.percentage)}% comprometido</small></span></div>;})}{!categories.length&&<EmptyState title="Sin categorías para mostrar"/>}</section>
 </div>;
}
