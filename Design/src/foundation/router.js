// Client-side navigation for calculators (e.g. "Hitung" → /hasil). Links are intercepted in app.js.
export function navigate(path,{replace=false}={}){
 history[replace?'replaceState':'pushState']({},'',path);
 window.dispatchEvent(new Event('sw:navigate'));
}
