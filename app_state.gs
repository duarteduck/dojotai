<script>
const State = {
  get uid(){ return localStorage.getItem('uid'); },
  set uid(v){ localStorage.setItem('uid', v); },
  clear(){ localStorage.removeItem('uid'); },
  cache: { atividades: [] }, ui: { minhas:false, nomeFiltro:"" }
};
</script>