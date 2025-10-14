// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
   // La app no hablará a tu API todavía; solo Realtime de Supabase
  supabaseUrl: 'https://dprkdppbgfietyzrjyqy.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcmtkcHBiZ2ZpZXR5enJqeXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTU1MjIsImV4cCI6MjA3NTc3MTUyMn0.xF91vn_fhNwHaA9wb_8DsQ6kbzrNIxMHC6ljuuXOe-s',
  apiBaseUrl: 'https://backend-php-r0ym.onrender.com'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
