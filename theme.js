/* shared dark/light theme toggle — used by every page (index.html, subject.html, maths-notes.html, maths-formula-booklet.html, maths-question-bank.html) */
(function(){
  var themeToggle = document.getElementById('theme-toggle');
  var labelLight = document.getElementById('label-light');
  var labelDark = document.getElementById('label-dark');
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ib-hub-theme', theme);
    var isDark = theme === 'dark';
    themeToggle.classList.toggle('is-dark', isDark);
    labelLight.classList.toggle('active', !isDark);
    labelDark.classList.toggle('active', isDark);
  }
  themeToggle.addEventListener('click', function(){
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  labelLight.addEventListener('click', function(){ applyTheme('light'); });
  labelDark.addEventListener('click', function(){ applyTheme('dark'); });
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
})();
