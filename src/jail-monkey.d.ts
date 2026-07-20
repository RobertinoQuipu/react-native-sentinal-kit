/**
 * Minimal ambient declaration so the demo typechecks without the
 * jail-monkey native package installed. The real package ships its own
 * types; this is a safe superset used only by the lazy require().
 */
declare module 'jail-monkey' {
  const JailMonkey: any;
  export default JailMonkey;
}
