export type Language = 'ko' | 'en' | 'zh' | 'vi';
export type Book = { id: string; title: string; author: string; publisher: string; registration: string; callNumber: string; status: 'available'|'loaned'|'reference'|'unknown'; shelf: string|null; tier: number; color: string; year: number };
export const books: Book[] = [
 {id:'b1',title:'International Business Law',author:'Ray August',publisher:'Pearson',registration:'L00012001',callNumber:'340.1 A923i',status:'available',shelf:'B-17',tier:3,color:'#a35132',year:2013},
 {id:'b2',title:'International Business Law',author:'Ray August',publisher:'Pearson',registration:'L00012002',callNumber:'340.1 A923i c.2',status:'loaned',shelf:'B-17',tier:3,color:'#a35132',year:2013},
 {id:'b3',title:'민법총칙',author:'김준호',publisher:'법문사',registration:'L00012003',callNumber:'345.1 김77ㅁ',status:'available',shelf:'A-03',tier:2,color:'#34524b',year:2023},
 {id:'b4',title:'Constitutional Law',author:'Erwin Chemerinsky',publisher:'Wolters Kluwer',registration:'L00012004',callNumber:'342.73 C517c',status:'available',shelf:'C-08',tier:4,color:'#293f62',year:2022},
 {id:'b5',title:'국제법',author:'정인섭',publisher:'박영사',registration:'L00012005',callNumber:'349 정68ㄱ',status:'available',shelf:'B-12',tier:2,color:'#713c47',year:2024},
 {id:'b6',title:'Black’s Law Dictionary',author:'Bryan A. Garner',publisher:'Thomson Reuters',registration:'L00012006',callNumber:'340.03 G234b',status:'reference',shelf:'A-03',tier:2,color:'#3b4556',year:2019},
 {id:'b7',title:'Human Rights',author:'Jack Donnelly',publisher:'Cornell University Press',registration:'L00012007',callNumber:'341.48 D683u',status:'unknown',shelf:'C-08',tier:3,color:'#996b32',year:2013},
 {id:'b8',title:'법학입문',author:'홍완식',publisher:'법문사',registration:'L00012008',callNumber:'340 홍65ㅂ',status:'available',shelf:null,tier:1,color:'#4a5969',year:2024},
];
export const fields = ['title','author','publisher','registration','callNumber'] as const;
export type Query = Partial<Record<typeof fields[number],string>>;
const norm=(v:string)=>v.trim().replace(/\s+/g,' ').toLowerCase();
export function searchBooks(query: Query, availableOnly=true) {
 const terms=fields.filter(f=>norm(query[f]||''));
 return books.map(book=>{let count=0,score=0; const matched:string[]=[];
   for(const f of terms){const term=norm(query[f]!); const value=norm(book[f]); if(f==='registration'?value===term:value.includes(term)){count++; matched.push(f);score+=1+(f==='registration'&&value===term?100:0)+(f==='callNumber'&&value===term?50:0);}}
   return {book,matched,score,count};
 }).filter(r=>(!availableOnly||r.book.status==='available')&&(!terms.length||r.count>0)).sort((a,b)=>b.score-a.score||a.book.id.localeCompare(b.book.id));
}
export const shelves: Record<string,{x:number;z:number}> = {'A-03':{x:1,z:0},'B-12':{x:5,z:-4},'B-17':{x:9,z:-8},'C-08':{x:13,z:-12}};
export function routeFor(book:Book): [number,number][] {
 if(book.status!=='available'||!book.shelf||!shelves[book.shelf]) return [];
 const p=shelves[book.shelf];
 return [[-2,21],[-2,14],[-2,8],[-2,p.z+1.9],[p.x,p.z+1.9]];
}
