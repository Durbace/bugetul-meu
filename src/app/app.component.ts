import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Kind = 'income' | 'expense' | 'transfer';
type Page = 'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'settings';
interface Account { id: string; name: string; icon: string; color: string; openingBalance: number; }
interface Transaction { id: string; kind: Kind; amount: number; date: string; category: string; accountId: string; toAccountId?: string; note: string; }
interface Budget { category: string; amount: number; }
interface DataStore { version: 1; accounts: Account[]; transactions: Transaction[]; budgets: Budget[]; demo: boolean; }
interface Category { name: string; icon: string; color: string; }
const KEY = 'bugetul-meu-v1';
const EXPENSE_CATEGORIES: Category[] = [
  {name:'Alimente',icon:'🛒',color:'#f4a340'}, {name:'Locuință',icon:'🏠',color:'#6d83f4'},
  {name:'Transport',icon:'🚙',color:'#14aa98'}, {name:'Facturi',icon:'💡',color:'#a479e9'},
  {name:'Sănătate',icon:'💊',color:'#e8799c'}, {name:'Cumpărături',icon:'🛍️',color:'#e69a67'},
  {name:'Divertisment',icon:'🎬',color:'#8e8bf0'}, {name:'Educație',icon:'📚',color:'#5f9bc7'},
  {name:'Călătorii',icon:'✈️',color:'#24bca7'}, {name:'Altele',icon:'📦',color:'#9aa4b8'}
];
const INCOME_CATEGORIES: Category[] = [
  {name:'Salariu',icon:'💼',color:'#14aa98'}, {name:'Freelance',icon:'💻',color:'#5e79e7'},
  {name:'Cadouri',icon:'🎁',color:'#e8799c'}, {name:'Investiții',icon:'📈',color:'#a479e9'},
  {name:'Alte venituri',icon:'✨',color:'#9aa4b8'}
];
function uid(): string { return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`; }
function isoLocal(d: Date): string { const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function sample(): DataStore {
  const now = new Date(); const day = (n: number) => isoLocal(new Date(now.getFullYear(),now.getMonth(),Math.min(n,new Date(now.getFullYear(),now.getMonth()+1,0).getDate())));
  const acc = [{id:'a1',name:'Card principal',icon:'💳',color:'#6674ed',openingBalance:4500},{id:'a2',name:'Numerar',icon:'💵',color:'#21b69c',openingBalance:850},{id:'a3',name:'Economii',icon:'🏦',color:'#e9a851',openingBalance:10000}];
  const tx: Transaction[] = [
    {id:uid(),kind:'income',amount:6800,date:day(2),category:'Salariu',accountId:'a1',note:'Salariu lunar'},
    {id:uid(),kind:'income',amount:700,date:day(5),category:'Freelance',accountId:'a1',note:'Proiect suplimentar'},
    {id:uid(),kind:'expense',amount:820,date:day(4),category:'Locuință',accountId:'a1',note:'Chirie / întreținere'},
    {id:uid(),kind:'expense',amount:475,date:day(7),category:'Alimente',accountId:'a1',note:'Cumpărături săptămânale'},
    {id:uid(),kind:'expense',amount:190,date:day(9),category:'Transport',accountId:'a2',note:'Carburant'},
    {id:uid(),kind:'expense',amount:260,date:day(12),category:'Facturi',accountId:'a1',note:'Utilități'},
    {id:uid(),kind:'expense',amount:145,date:day(15),category:'Divertisment',accountId:'a1',note:'Ieșire în oraș'},
    {id:uid(),kind:'expense',amount:310,date:day(19),category:'Alimente',accountId:'a1',note:'Supermarket'},
    {id:uid(),kind:'expense',amount:120,date:day(22),category:'Sănătate',accountId:'a2',note:'Farmacie'},
    {id:uid(),kind:'transfer',amount:1100,date:day(8),category:'Transfer',accountId:'a1',toAccountId:'a3',note:'Economii lunare'}
  ];
  return {version:1,accounts:acc,transactions:tx,budgets:[{category:'Alimente',amount:1300},{category:'Locuință',amount:1500},{category:'Transport',amount:600},{category:'Facturi',amount:500},{category:'Divertisment',amount:450},{category:'Sănătate',amount:300}],demo:true};
}
@Component({selector:'app-root',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./app.component.html',styleUrl:'./app.component.css'})
export class AppComponent implements OnInit {
  readonly expenses = EXPENSE_CATEGORIES; readonly incomes = INCOME_CATEGORIES;
  page: Page = 'dashboard'; data: DataStore = sample(); month = new Date(new Date().getFullYear(),new Date().getMonth(),1);
  dark = false; search = ''; kindFilter = 'all'; categoryFilter = 'all'; accountFilter = 'all';
  transactionModal = false; accountModal = false; editingTransactionId: string | null = null; editingAccountId: string | null = null;
  txForm: Transaction = this.emptyTransaction(); accountForm: Account = this.emptyAccount();
  budgetCategory = EXPENSE_CATEGORIES[0].name; budgetValue: number | null = null;
  toast = ''; importError = ''; mobileNav = false;

  ngOnInit(): void {
    try { const raw=localStorage.getItem(KEY); if(raw) {const obj=JSON.parse(raw); if(this.isValidStore(obj)) this.data=obj; } } catch { /* demo data remains available */ }
    try {this.dark=localStorage.getItem('bugetul-meu-theme')==='dark';} catch {}
    this.applyTheme();
  }
  private isValidStore(o: any): o is DataStore { return !!o && o.version===1 && Array.isArray(o.accounts) && Array.isArray(o.transactions) && Array.isArray(o.budgets); }
  private persist(): void { try {localStorage.setItem(KEY,JSON.stringify(this.data));} catch {this.notify('Nu s-a putut salva în browser. Exportă un backup.');} }
  notify(message: string): void {this.toast=message;}
  dismissToast(): void {this.toast='';}
  selectPage(p: Page): void {this.page=p;this.mobileNav=false;}
  setTheme(value: boolean): void {this.dark=value;this.applyTheme();try{localStorage.setItem('bugetul-meu-theme',value?'dark':'light');}catch{}}
  private applyTheme():void {document.documentElement.classList.toggle('dark',this.dark);}
  monthLabel(): string {return new Intl.DateTimeFormat('ro-RO',{month:'long',year:'numeric'}).format(this.month);}
  moveMonth(delta: number): void {this.month=new Date(this.month.getFullYear(),this.month.getMonth()+delta,1);}
  get monthKey(): string {return `${this.month.getFullYear()}-${String(this.month.getMonth()+1).padStart(2,'0')}`;}
  get currentMonthTransactions(): Transaction[] {return this.data.transactions.filter(t=>t.date.startsWith(this.monthKey));}
  get incomeTotal(): number {return this.currentMonthTransactions.filter(t=>t.kind==='income').reduce((s,t)=>s+t.amount,0);}
  get expenseTotal(): number {return this.currentMonthTransactions.filter(t=>t.kind==='expense').reduce((s,t)=>s+t.amount,0);}
  get netTotal(): number {return this.incomeTotal-this.expenseTotal;}
  get totalBalance(): number {return this.data.accounts.reduce((s,a)=>s+this.balance(a.id),0);}
  balance(id:string):number {return (this.data.accounts.find(a=>a.id===id)?.openingBalance ?? 0) + this.data.transactions.reduce((s,t)=>s+(t.kind==='income'&&t.accountId===id?t.amount:0)-(t.kind==='expense'&&t.accountId===id?t.amount:0)-(t.kind==='transfer'&&t.accountId===id?t.amount:0)+(t.kind==='transfer'&&t.toAccountId===id?t.amount:0),0);}
  get expenseBreakdown(): Array<Category & {amount:number;percent:number}> {return this.expenses.map(c=>({...c,amount:this.sumCategory(c.name),percent:this.expenseTotal?this.sumCategory(c.name)/this.expenseTotal*100:0})).filter(x=>x.amount>0).sort((a,b)=>b.amount-a.amount);}
  get donutStyle(): string {let pos=0;const segments=this.expenseBreakdown.map(c=>{const start=pos;pos+=c.percent;return `${c.color} ${start}% ${pos}%`;});return segments.length?`conic-gradient(${segments.join(',')})`:'conic-gradient(var(--line) 0 100%)';}
  sumCategory(name:string):number {return this.currentMonthTransactions.filter(t=>t.kind==='expense'&&t.category===name).reduce((s,t)=>s+t.amount,0);}
  get budgetSpent():number {return this.data.budgets.reduce((s,b)=>s+this.sumCategory(b.category),0);}
  get budgetTotal():number {return this.data.budgets.reduce((s,b)=>s+b.amount,0);}
  budgetPercent(b:Budget):number {return b.amount>0?Math.min(100,100*this.sumCategory(b.category)/b.amount):0;}
  get unbudgetedCategories():Category[] {return this.expenses.filter(c=>!this.data.budgets.some(b=>b.category===c.name));}
  category(name:string):Category {return [...this.expenses,...this.incomes].find(c=>c.name===name)??{name:'Transfer',icon:'⇄',color:'#6674ed'};}
  accountName(id?:string):string {return this.data.accounts.find(a=>a.id===id)?.name??'Cont șters';}
  get filteredTransactions():Transaction[] {const query=this.search.trim().toLocaleLowerCase('ro'); return this.currentMonthTransactions.filter(t=>(this.kindFilter==='all'||t.kind===this.kindFilter)&&(this.categoryFilter==='all'||t.category===this.categoryFilter)&&(this.accountFilter==='all'||t.accountId===this.accountFilter||t.toAccountId===this.accountFilter)&&(!query||[t.note,t.category,this.accountName(t.accountId),this.accountName(t.toAccountId)].some(x=>x.toLocaleLowerCase('ro').includes(query)))).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));}
  get recentTransactions():Transaction[] {return [...this.currentMonthTransactions].sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)).slice(0,6);}
  get recentForAccounts():Transaction[] {return [...this.data.transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);}
  clampPercent(value:number):number {return Math.max(0,Math.min(100,value));}
  fmt(amount:number):string {return new Intl.NumberFormat('ro-RO',{style:'currency',currency:'RON',maximumFractionDigits:2}).format(amount);}
  dateFmt(value:string):string {return new Intl.DateTimeFormat('ro-RO',{day:'numeric',month:'short'}).format(new Date(`${value}T12:00:00`));}
  emptyTransaction():Transaction {return {id:uid(),kind:'expense',amount:0,date:isoLocal(new Date()),category:'Alimente',accountId:this.data?.accounts?.[0]?.id??'a1',note:''};}
  emptyAccount():Account {return {id:uid(),name:'',icon:'💳',color:'#6674ed',openingBalance:0};}
  openTransaction(kind:Kind='expense',tx?:Transaction):void {this.editingTransactionId=tx?.id??null;this.txForm=tx?{...tx}:{...this.emptyTransaction(),kind,category:kind==='income'?'Salariu':kind==='transfer'?'Transfer':'Alimente'};this.transactionModal=true;}
  changeKind(k:Kind):void {this.txForm.kind=k;this.txForm.category=k==='income'?'Salariu':k==='expense'?'Alimente':'Transfer';}
  saveTransaction():void {
    const t={...this.txForm,amount:Number(this.txForm.amount)};
    if(!Number.isFinite(t.amount)||t.amount<=0){this.notify('Introdu o sumă mai mare decât zero.');return;}
    if(!/^\d{4}-\d{2}-\d{2}$/.test(t.date)||Number.isNaN(new Date(`${t.date}T12:00:00`).getTime())){this.notify('Alege o dată validă.');return;}
    if(!this.data.accounts.some(a=>a.id===t.accountId)){this.notify('Selectează un cont valid.');return;}
    if(t.kind==='transfer'&&(!t.toAccountId||t.toAccountId===t.accountId||!this.data.accounts.some(a=>a.id===t.toAccountId))){this.notify('Alege două conturi diferite.');return;}
    if(t.kind!=='transfer')delete t.toAccountId;
    if(this.editingTransactionId){this.data.transactions=this.data.transactions.map(x=>x.id===this.editingTransactionId?t:x);}else{this.data.transactions.unshift(t);}
    this.data.demo=false;this.persist();this.transactionModal=false;this.notify('Tranzacția a fost salvată.');
  }
  removeTransaction(t:Transaction):void {if(!confirm(`Ștergi tranzacția de ${this.fmt(t.amount)}?`))return;this.data.transactions=this.data.transactions.filter(x=>x.id!==t.id);this.persist();this.notify('Tranzacția a fost ștearsă.');}
  openAccount(a?:Account):void {this.editingAccountId=a?.id??null;this.accountForm=a?{...a}:this.emptyAccount();this.accountModal=true;}
  saveAccount():void {const a={...this.accountForm,name:this.accountForm.name.trim(),openingBalance:Number(this.accountForm.openingBalance)};if(!a.name||!Number.isFinite(a.openingBalance)){this.notify('Completează numele și soldul contului.');return;}if(this.editingAccountId){this.data.accounts=this.data.accounts.map(x=>x.id===a.id?a:x);}else{this.data.accounts.push(a);}this.data.demo=false;this.persist();this.accountModal=false;this.notify('Contul a fost salvat.');}
  removeAccount(a:Account):void {if(this.data.accounts.length<=1){this.notify('Trebuie să păstrezi cel puțin un cont.');return;}if(this.data.transactions.some(t=>t.accountId===a.id||t.toAccountId===a.id)){this.notify('Contul are tranzacții. Șterge-le sau mută-le înainte.');return;}if(!confirm(`Ștergi contul „${a.name}”?`))return;this.data.accounts=this.data.accounts.filter(x=>x.id!==a.id);this.persist();}
  saveBudget():void {const amount=Number(this.budgetValue);if(!Number.isFinite(amount)||amount<=0){this.notify('Introdu o limită pozitivă.');return;}const existing=this.data.budgets.find(b=>b.category===this.budgetCategory);if(existing)existing.amount=amount;else this.data.budgets.push({category:this.budgetCategory,amount});this.data.demo=false;this.persist();this.budgetValue=null;this.notify('Bugetul a fost salvat.');}
  updateBudget(b:Budget,value:string):void {const n=Number(value);if(!Number.isFinite(n)||n<=0){this.notify('Bugetul trebuie să fie pozitiv.');return;}b.amount=n;this.persist();this.notify('Limita a fost actualizată.');}
  removeBudget(b:Budget):void {this.data.budgets=this.data.budgets.filter(x=>x.category!==b.category);this.persist();this.notify('Bugetul a fost eliminat.');}
  startFresh():void {if(!confirm('Ștergi toate datele, inclusiv exemplele? Recomandăm să exporți un backup înainte.'))return;this.data={version:1,accounts:[{id:uid(),name:'Cont principal',icon:'💳',color:'#6674ed',openingBalance:0}],transactions:[],budgets:[],demo:false};this.persist();this.selectPage('dashboard');this.notify('Ai început cu un buget gol.');}
  restoreDemo():void {if(!confirm('Înlocuiești toate datele actuale cu exemple demonstrative?'))return;this.data=sample();this.persist();this.selectPage('dashboard');this.notify('Datele demonstrative au fost încărcate.');}
  download(name:string,content:string,type:string):void {const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  exportJson():void {this.download(`bugetul-meu-backup-${isoLocal(new Date())}.json`,JSON.stringify(this.data,null,2),'application/json');this.notify('Backup-ul JSON a fost descărcat.');}
  exportCsv():void {const values=[['Data','Tip','Suma RON','Categorie','Cont','Cont destinație','Descriere'],...this.data.transactions.map(t=>[t.date,t.kind,String(t.amount),t.category,this.accountName(t.accountId),t.toAccountId?this.accountName(t.toAccountId):'',t.note])];const csv='\uFEFF'+values.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\r\n');this.download(`tranzactii-${isoLocal(new Date())}.csv`,csv,'text/csv;charset=utf-8');this.notify('Fișierul CSV a fost descărcat.');}
  importJson(event:Event):void {const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const obj=JSON.parse(String(reader.result));if(!this.isValidStore(obj)||!this.validContent(obj))throw Error('Invalid');if(!confirm('Importul va înlocui toate datele existente. Continui?'))return;this.data=obj;this.persist();this.notify('Backup-ul a fost importat.');this.importError='';}catch{this.importError='Fișier incompatibil. Alege un backup JSON exportat din aplicație.';}finally{input.value='';}};reader.onerror=()=>{this.importError='Fișierul nu a putut fi citit.';input.value='';};reader.readAsText(file);}
  private validContent(v:DataStore):boolean {const ids=new Set(v.accounts.map(a=>a.id));return v.accounts.length>0&&v.accounts.every(a=>typeof a.id==='string'&&typeof a.name==='string'&&Number.isFinite(a.openingBalance))&&v.transactions.every(t=>typeof t.id==='string'&&['income','expense','transfer'].includes(t.kind)&&Number.isFinite(t.amount)&&t.amount>0&&typeof t.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(t.date)&&ids.has(t.accountId)&&(t.kind!=='transfer'||(!!t.toAccountId&&ids.has(t.toAccountId)&&t.accountId!==t.toAccountId)))&&v.budgets.every(b=>typeof b.category==='string'&&Number.isFinite(b.amount)&&b.amount>0);}
  get lastSixMonths():Array<{label:string;income:number;expense:number;heightIncome:number;heightExpense:number}> {const arr=[];for(let i=5;i>=0;i--){const d=new Date(this.month.getFullYear(),this.month.getMonth()-i,1);const prefix=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;const tx=this.data.transactions.filter(t=>t.date.startsWith(prefix));const income=tx.filter(t=>t.kind==='income').reduce((s,t)=>s+t.amount,0);const expense=tx.filter(t=>t.kind==='expense').reduce((s,t)=>s+t.amount,0);arr.push({label:new Intl.DateTimeFormat('ro-RO',{month:'short'}).format(d),income,expense,heightIncome:0,heightExpense:0});}const max=Math.max(1,...arr.map(a=>Math.max(a.income,a.expense)));return arr.map(a=>({...a,heightIncome:a.income/max*100,heightExpense:a.expense/max*100}));}
}
