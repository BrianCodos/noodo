import type {Attachment,Document,Minutes,FileVersion} from './types';
type Versioned = Document | Minutes;
export function fileSnapshot(row:Versioned):FileVersion {
 return {version:row.version||1,title:row.title,filename:row.filename||'',blobKey:row.blobKey,content:'body' in row?`${row.body}\n\nDecisiones y acuerdos\n${row.decisions}`:row.content,createdAt:row.createdAt||''};
}
export function preserveVersions(before:Versioned|undefined,record:Versioned):Versioned {
 if(!before)return {...record,version:1,createdAt:record.createdAt||new Date().toISOString(),versions:[]};
 const old=fileSnapshot(before),next=fileSnapshot(record);
 const changed=['title','filename','blobKey','content'].some(k=>old[k as keyof FileVersion]!==next[k as keyof FileVersion]);
 return {...record,version:changed?old.version+1:old.version,createdAt:changed?new Date().toISOString():before.createdAt||'',versions:changed?[...(before.versions||[]),old]:(before.versions||[])};
}
export function currentAttachments(rows:Attachment[]):Attachment[]{
 const groups=new Map<string,Attachment>();
 for(const row of rows){const key=row.groupId||row.id;const previous=groups.get(key);if(!previous||(row.version||1)>(previous.version||1))groups.set(key,row);}
 return [...groups.values()];
}
export function attachmentVersions(row:Attachment,rows:Attachment[]):Attachment[]{return rows.filter(a=>(a.groupId||a.id)===(row.groupId||row.id)).sort((a,b)=>(b.version||1)-(a.version||1));}
