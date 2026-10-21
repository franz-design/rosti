/**
 * iOS Safari zooms in when a field under 16px is focused, then keeps that
 * scale for the tab — including after blur and reload. Briefly clamping
 * maximum-scale forces the scale back to 1. Restoring the original viewport
 * meta leaves pinch-zoom available.
 *
 * The script tag must sit after the viewport meta so the tag already exists.
 */
export const iosViewportResetScript = `(function(){
  var ua=navigator.userAgent||"";
  var isIOS=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  if(!isIOS)return;
  var meta=document.querySelector('meta[name="viewport"]');
  if(!meta)return;
  var original=meta.getAttribute("content");
  if(!original)return;
  window.addEventListener("pageshow",function(){
    meta.setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover");
    window.setTimeout(function(){meta.setAttribute("content",original);},100);
  });
})();
`
