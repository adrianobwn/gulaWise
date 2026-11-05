// Session-only storage. Nothing leaves the browser; closing the tab clears it.
const read=key=>{try{return JSON.parse(sessionStorage.getItem(key))}catch{return null}};
const write=(key,value)=>{try{value===null?sessionStorage.removeItem(key):sessionStorage.setItem(key,JSON.stringify(value))}catch{}};
export const loadDraft=key=>read(`sugarwise:draft:${key}`);
export const saveDraft=(key,state)=>write(`sugarwise:draft:${key}`,state);
export const loadResult=()=>read('sugarwise:result');
export const saveResult=result=>write('sugarwise:result',result);
export const loadUmkm=()=>read('sugarwise:umkm');
export const saveUmkm=value=>write('sugarwise:umkm',value);
