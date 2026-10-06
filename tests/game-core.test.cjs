const test = require('node:test');
const assert = require('node:assert/strict');
const { create, steer, collision, update, LANES } = require('../game-core.js');
function running(mode = 'easy') { const s = create(mode); s.phase = 'running'; return s; }
test('starts in a ready state and rejects unknown modes', () => { assert.equal(create().phase, 'ready'); assert.equal(create('unknown').mode, 'easy'); });
test('steering is ignored before start and bounded to the road', () => { const s=create(); steer(s,-1);assert.equal(s.lane,1);s.phase='running';for(let i=0;i<5;i++)steer(s,-1);assert.equal(s.lane,0);for(let i=0;i<5;i++)steer(s,1);assert.equal(s.lane,2); });
test('lane transitions move smoothly through actual road coordinates', () => { const s=running();steer(s,1);update(s,1/120);assert.ok(s.x>216&&s.x<324); });
test('collision uses actual position while changing lanes', () => { const s=running();steer(s,1);assert.equal(collision(s,{lane:1,y:s.y}),true);assert.equal(collision(s,{lane:2,y:s.y}),false);s.x=324;assert.equal(collision(s,{lane:2,y:s.y}),true); });
test('collision ends the run without awarding a point', () => { const s=running();s.obstacles=[{lane:1,y:s.y,color:0,wave:{counted:false}}];update(s,1/120);assert.equal(s.phase,'over');assert.equal(s.score,0); });
test('each traffic wave counts once even when it contains two cars', () => { const s=running();const wave={counted:false};s.obstacles=[{lane:0,y:620,wave},{lane:2,y:620,wave}];update(s,1/120);assert.equal(s.score,1);update(s,1/120);assert.equal(s.score,1); });
test('pause freezes score, movement, and spawning', () => { const s=running();update(s,.02);s.phase='paused';const before=JSON.stringify(s);update(s,10);steer(s,-1);assert.equal(JSON.stringify(s),before); });
test('every generated traffic wave leaves a lane open across all difficulties', () => { for(const mode of ['easy','medium','hard'])for(let seed=0;seed<90;seed++){const s=running(mode);s.spawnIn=0;update(s,1/120,()=>seed/90);const lanes=new Set(s.obstacles.map(o=>o.lane));assert.ok(lanes.size>=1&&lanes.size<=2);assert.ok([...lanes].every(l=>l>=0&&l<3));} });
test('60 Hz and 120 Hz rendering simulate the same distance', () => { function simulate(hz){const s=running();let bank=0;for(let i=0;i<hz*2;i++){bank+=1/hz;while(bank>=1/120){update(s,1/120,()=>.5);bank-=1/120;}}return s;}assert.deepEqual(simulate(60),simulate(120)); });
test('long runs cull old traffic and can score in every mode', () => { for(const mode of ['easy','medium','hard']){const s=running(mode);for(let i=0;i<120*50;i++)update(s,1/120,()=>.5);assert.equal(s.phase,'running');assert.ok(s.score>20);assert.ok(s.obstacles.length<14);} });
test('invalid time steps cannot corrupt state',()=>{const s=running();const before=JSON.stringify(s);for(const dt of [NaN,Infinity,-1,0])update(s,dt);assert.equal(JSON.stringify(s),before);});
