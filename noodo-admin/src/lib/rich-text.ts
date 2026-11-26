export const richTags=['p','div','br','strong','em','u','mark','ul','ol','li','span'] as const;
export type RichTag=typeof richTags[number];
export type RichNode=string|{tag:RichTag;align?:'left'|'center'|'right'|'justify';children:RichNode[]};
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const alignments=['left','center','right','justify'];
/** Limit stored/imported data to text and known formatting; never accept HTML attributes. */
export function normalizeRich(value:unknown,depth=0):RichNode[]{
 if(!Array.isArray(value)||depth>40)return [];
 return value.flatMap((node):RichNode[]=>{
  if(typeof node==='string')return [node];
  if(!node||typeof node!=='object'||!richTags.includes(node.tag))return [];
  const children=normalizeRich(node.children,depth+1);const tag=node.tag==='p'&&children.some(n=>typeof n!=='string'&&['p','div','ul','ol'].includes(n.tag))?'div':node.tag;
  return [{tag,children,...(alignments.includes(node.align)?{align:node.align}:{})}];
 });
}
export function richFromText(text:string):RichNode[]{return text.split(/\r?\n/).map(line=>({tag:'p',children:line?[line]:[{tag:'br',children:[]}]}));}
export function richToHtml(value:unknown):string{return normalizeRich(value).map(n=>typeof n==='string'?escape(n):n.tag==='br'?'<br>':`<${n.tag}${n.align?` style="text-align:${n.align}"`:''}>${richToHtml(n.children)}</${n.tag}>`).join('');}
export function richToText(value:unknown):string{
 const walk=(nodes:RichNode[]):string=>nodes.map(n=>typeof n==='string'?n:n.tag==='br'?'\n':(['p','div','li'].includes(n.tag)&&n.children.length===1&&typeof n.children[0]!=='string'&&n.children[0].tag==='br'?'':walk(n.children))+(['p','div','li'].includes(n.tag)?'\n':'')).join('');
 return walk(normalizeRich(value)).replace(/\n$/,'');
}
/** Read only editable DOM, copying no URLs, handlers, classes or arbitrary styles. */
export function richFromDom(root:HTMLElement):RichNode[]{
 const read=(node:Node):RichNode[]=>{
  if(node.nodeType===3)return [node.textContent||''];
  if(node.nodeType!==1)return [];
  const element=node as HTMLElement;const name=element.tagName.toLowerCase();
  if(['script','style','iframe','object','svg','img','video','audio'].includes(name))return [];
  let children=[...element.childNodes].flatMap(read);
  const tag=(name==='b'?'strong':name==='i'?'em':richTags.includes(name as RichTag)?name:'span') as RichTag;
  const weight=element.style.fontWeight;
  if(tag!=='strong'&&(weight==='bold'||Number(weight)>=600))children=[{tag:'strong',children}];
  const background=element.style.backgroundColor;
  if(tag!=='mark'&&background&&background!=='transparent'&&background!=='rgba(0, 0, 0, 0)')children=[{tag:'mark',children}];
  const align=element.style.textAlign||element.getAttribute('align');
  return [{tag,children,...(alignments.includes(align||'')?{align:align as 'left'}:{})}];
 };
 return normalizeRich([...root.childNodes].flatMap(read));
}
