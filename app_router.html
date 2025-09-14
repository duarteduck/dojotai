<script>
/**
 * Router simples por hash:
 * - #/login
 * - #/dash
 * - #/new
 * - #/edit?id={ID}
 */
var Router = {
  start: function(){
    try { window.addEventListener('hashchange', this.resolve.bind(this)); } catch(e){}
    this.resolve();
  },
  mount: function(view){
    var root = document.getElementById('app');
    if (!root) return;

    var tplId = 'tpl-login';
    if (view === 'dash') tplId = 'tpl-dash';
    if (view === 'new')  tplId = 'tpl-new';

    var tpl = document.getElementById('tpl-'+view) || document.getElementById(tplId);
    if (tpl){
      root.innerHTML = tpl.innerHTML;
      var init = (view==='login' ? Views.initLogin :
                 (view==='dash' ? Views.initDash :
                 (view==='new'  ? Views.initNew  : null)));
      if (typeof init === 'function') init();
    }
  },

  resolve: function(){
    var route = (location.hash || '#/login');
    var authed = !!(window.localStorage && localStorage.getItem('uid'));

    if (route.indexOf('#/dash') === 0 && !authed) { return this.go('#/login'); }
    if (route.indexOf('#/new')  === 0 && !authed) { return this.go('#/login'); }
    if (route.indexOf('#/edit') === 0 && !authed) { return this.go('#/login'); }
    if (route.indexOf('#/login')=== 0 && authed)  { return this.go('#/dash'); }

    var view = 'login';
    if (route.indexOf('#/dash') === 0) view = 'dash';
    if (route.indexOf('#/new')  === 0) view = 'new';
    if (route.indexOf('#/edit') === 0) view = 'new';

    this.mount(view);
  },

  go: function(hash){ location.hash = hash; }
};
</script>