import test from 'node:test';
import assert from 'node:assert/strict';
import {books,searchBooks,routeFor,shelves} from '../lib/catalog.ts';
test('OR search retains matches from different fields',()=>{
 const rows=searchBooks({title:'Constitutional',author:'정인섭'},false);
 assert.deepEqual(rows.map(r=>r.book.id).sort(),['b4','b5']);
});
test('registration is exact, case-insensitive and trimmed',()=>{
 assert.equal(searchBooks({registration:' l00012001 '})[0].book.id,'b1');
 assert.equal(searchBooks({registration:'L00012'}).length,0);
});
test('availability filtering and unmapped copies do not create routes',()=>{
 assert.ok(searchBooks({}).every(r=>r.book.status==='available'));
 for(const b of books.filter(b=>b.status!=='available'||!b.shelf)) assert.deepEqual(routeFor(b),[]);
 assert.equal(searchBooks({title:'International'},false).length,2);
});
test('exact registration outranks another field match',()=>{
 assert.equal(searchBooks({registration:'L00012005',title:'International'},false)[0].book.id,'b5');
});
test('mapped paths begin at entrance and never cross modeled shelf footprints',()=>{
 for(const b of books.filter(b=>b.status==='available'&&b.shelf)){
  const points=routeFor(b);assert.deepEqual(points[0],[-2,21]);
  const shelf=shelves[b.shelf];assert.deepEqual(points.at(-1),[shelf.x,shelf.z+1.9]);
  for(let j=1;j<points.length;j++)for(let s=0;s<=100;s++){
   const x=points[j-1][0]+(points[j][0]-points[j-1][0])*s/100,z=points[j-1][1]+(points[j][1]-points[j-1][1])*s/100;
   for(let r=0;r<6;r++)for(let c=0;c<4;c++)assert.ok(!(Math.abs(x-(1+c*4))<1.7&&Math.abs(z-(-16+r*4))<.6),'route intersects a shelf');
  }
 }
});
