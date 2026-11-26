import type {RichNode} from '../lib/rich-text';
export type ProjectStatus = 'En planeación' | 'En curso' | 'En pausa' | 'Finalizado';
export interface Partner { id: string; name: string; email: string; active: boolean; photo?: string; role?: string }
export interface Project { priority?: 'Baja' | 'Media' | 'Alta'; descriptionRich?: RichNode[]; deletedAt?: string; partnerIds?: string[]; id: string; name: string; client: string; kind: string; owner: string; status: ProjectStatus; deadline: string; description: string; contactIds: string[] }
export interface Contact { projectId?: string; id: string; name: string; company: string; email: string; phone: string; role: string }
export interface QuoteItem { description: string; quantity: number; price: number }
export interface Quote { id: string; projectId: string; title: string; items: QuoteItem[]; tax: number; status: 'Borrador' | 'Enviada' | 'Aceptada' | 'Rechazada'; validUntil: string; notes: string }
export interface Meeting { id: string; projectId: string; title: string; date: string; time: string; attendees: string; location: string; description?: string; status?: 'Programada' | 'Realizada' | 'Cancelada' }
export interface FileVersion { version: number; title: string; filename: string; blobKey?: string; content: string; createdAt: string }
export interface VersionedFile { versions?: FileVersion[]; deletedAt?: string }
export interface Minutes extends VersionedFile { version?: number; filename?: string; blobKey?: string; createdAt?: string; id: string; projectId: string; meetingId: string; title: string; body: string; decisions: string }
export interface Task { requirements?: string; partnerIds?: string[]; id: string; projectId: string; title: string; owner: string; due: string; done: boolean; status?: TaskStatus; priority?: 'Baja' | 'Media' | 'Alta'; description?: string; meetingId?: string; parentId?: string; startDate?: string; progress?: number }
export interface Document extends VersionedFile { id: string; projectId: string; title: string; version: number; filename: string; createdAt: string; content: string; status: 'Borrador' | 'En revisión'; blobKey?: string }
export type TaskStatus = 'Pendiente' | 'En curso' | 'Completada';
export interface Attachment { groupId?: string; previousId?: string; version?: number; deletedAt?: string; id: string; projectId: string; entityType: 'meeting' | 'transaction' | 'task' | 'deliverable' | 'project'; entityId: string; filename: string; blobKey: string; size: number; createdAt: string }
export interface FollowUp { mentions?: {partnerId:string;name:string}[]; authorId?: string; authorName?: string; id: string; projectId: string; entityType: 'meeting' | 'task' | 'project'; entityId: string; body: string; createdAt: string }
export interface Transaction { id: string; projectId: string; title: string; type: 'Ingreso' | 'Egreso'; amount: number; date: string; category: string; counterparty: string; notes: string; status: 'Registrado' | 'Anulado' }
export interface Activity { actorId?: string; origin?: string; id: string; projectId: string; description: string; at: string; actor?: string; collection?: string; recordId?: string; action?: string; before?: unknown; after?: unknown }
export interface Deliverable { id: string; projectId: string; taskId: string; title: string; criteria: string; due: string; status: 'Pendiente' | 'En revisión' | 'Entregado'; url: string }
export interface Database { version: 1; budgets: Budget[]; moneySources: MoneySource[]; partners: Partner[]; deliverables: Deliverable[]; projects: Project[]; contacts: Contact[]; quotes: Quote[]; meetings: Meeting[]; minutes: Minutes[]; tasks: Task[]; documents: Document[]; activity: Activity[]; attachments: Attachment[]; followUps: FollowUp[]; transactions: Transaction[] }
export type Collection = Exclude<keyof Database, 'version' | 'activity'>;
export type BudgetColor='accent'|'success'|'warning'|'info'|'neutral';
export interface BudgetReceipt {id:string;filename:string;blobKey:string;size:number;createdAt:string}
export interface BudgetExpense {id:string;categoryId:string;amount:number;description:string;date:string;isProjected:boolean;moneySourceId?:string;receipts?:BudgetReceipt[];voidedAt?:string}
export interface BudgetCategory {id:string;name:string;allocatedAmount:number;color:BudgetColor;groupId?:string;isCompleted?:boolean;deletedAt?:string}
export interface BudgetGroup {id:string;budgetId:string;name:string;color:BudgetColor;icon?:string;deletedAt?:string}
export interface Budget {id:string;name:string;totalBudget?:number;projectId?:string;categories:BudgetCategory[];categoryGroups:BudgetGroup[];expenses:BudgetExpense[];createdAt:string;archivedAt?:string;deletedAt?:string;isPinned?:boolean;isActive?:boolean;order?:number}
export interface MoneySource {id:string;name:string;type:'cash'|'bank_account'|'debit'|'credit'|'cdt'|'other';balance:number;budget?:number;interestRate?:number;archivedAt?:string}
