/* ---- shared content search index & topbar search wiring ---- */
/* used by maths-notes.html, maths-question-bank.html, maths-formula-booklet.html */
/* each entry maps one sub-subtopic to its notes page and question bank deep links */
var SEARCH_INDEX = [
  { subsub:'1.1.1', title:'Standard Form', subtopic:'1.1 Number & Algebra Tools', keywords:['standard form','scientific notation','powers of 10','a x 10 to the n'] },
  { subsub:'1.1.2', title:'Laws of Indices', subtopic:'1.1 Number & Algebra Tools', keywords:['indices','exponents','powers','negative index','fractional index','surds'] },
  { subsub:'1.1.3', title:'Partial Fractions', subtopic:'1.1 Number & Algebra Tools', keywords:['partial fractions','repeated factor','algebraic fractions'] },
  { subsub:'1.2.1', title:'Introduction to Logarithms', subtopic:'1.2 Exponentials & Logs', keywords:['logarithms','logs','log definition','exponential form'] },
  { subsub:'1.2.2', title:'Laws of Logarithms', subtopic:'1.2 Exponentials & Logs', keywords:['log laws','product law','quotient law','change of base'] },
  { subsub:'1.2.3', title:'Solving Exponential Equations', subtopic:'1.2 Exponentials & Logs', keywords:['exponential equations','solve for x in exponent','same base method'] },
  { subsub:'1.3.1', title:'Language of Sequences & Series', subtopic:'1.3 Sequences & Series', keywords:['sequences','series','sigma notation','recursive formula'] },
  { subsub:'1.3.2', title:'Arithmetic Sequences & Series', subtopic:'1.3 Sequences & Series', keywords:['arithmetic sequence','common difference','arithmetic series'] },
  { subsub:'1.3.3', title:'Geometric Sequences & Series', subtopic:'1.3 Sequences & Series', keywords:['geometric sequence','common ratio','sum to infinity'] },
  { subsub:'1.3.4', title:'Applications of Sequences & Series', subtopic:'1.3 Sequences & Series', keywords:['sequences applications','modelling','real world sequences'] },
  { subsub:'1.3.5', title:'Compound Interest & Depreciation', subtopic:'1.3 Sequences & Series', keywords:['compound interest','depreciation','finance'] },
  { subsub:'1.4.1', title:'Proof', subtopic:'1.4 Simple Proof & Reasoning', keywords:['proof','direct proof','proof by exhaustion','counterexample'] },
  { subsub:'1.5.1', title:'Proof by Induction', subtopic:'1.5 Further Proof & Reasoning', keywords:['induction','mathematical induction','inductive step'] },
  { subsub:'1.5.2', title:'Proof by Contradiction', subtopic:'1.5 Further Proof & Reasoning', keywords:['contradiction','proof by contradiction','irrational proof'] },
  { subsub:'1.6.1', title:'Binomial Theorem', subtopic:'1.6 Binomial Theorem', keywords:['binomial theorem','binomial expansion','pascals triangle','binomial coefficient'] },
  { subsub:'1.6.2', title:'Extension of The Binomial Theorem', subtopic:'1.6 Binomial Theorem', keywords:['extended binomial','negative power expansion','fractional power expansion'] },
  { subsub:'1.7.1', title:'Counting Principles', subtopic:'1.7 Permutations & Combinations', keywords:['counting principles','multiplicative principle','factorial'] },
  { subsub:'1.7.2', title:'Permutations & Combinations', subtopic:'1.7 Permutations & Combinations', keywords:['permutations','combinations','npr','ncr'] },
  { subsub:'1.8.1', title:'Intro to Complex Numbers', subtopic:'1.8 Complex Numbers', keywords:['complex numbers','imaginary numbers','i squared'] },
  { subsub:'1.8.2', title:'Modulus & Argument', subtopic:'1.8 Complex Numbers', keywords:['modulus','argument','complex number modulus'] },
  { subsub:'1.8.3', title:'Introduction to Argand Diagrams', subtopic:'1.8 Complex Numbers', keywords:['argand diagram','complex plane','locus'] },
  { subsub:'1.9.1', title:'Geometry of Complex Numbers', subtopic:'1.9 Further Complex Numbers', keywords:['complex number geometry','rotation','complex vectors'] },
  { subsub:'1.9.2', title:'Forms of Complex Numbers', subtopic:'1.9 Further Complex Numbers', keywords:['polar form','exponential form','eulers formula'] },
  { subsub:'1.9.3', title:'Complex Roots of Polynomials', subtopic:'1.9 Further Complex Numbers', keywords:['complex roots','conjugate root theorem','polynomial roots'] },
  { subsub:'1.9.4', title:'De Moivre’s Theorem', subtopic:'1.9 Further Complex Numbers', keywords:['de moivre','trig identities from powers','cos 3 theta'] },
  { subsub:'1.9.5', title:'Roots of Complex Numbers', subtopic:'1.9 Further Complex Numbers', keywords:['nth roots','roots of unity','cube roots complex'] },
  { subsub:'1.10.1', title:'Systems of Linear Equations', subtopic:'1.10 Systems of Linear Equations', keywords:['systems of equations','simultaneous equations','linear systems'] },
  { subsub:'1.10.2', title:'Algebraic Solutions', subtopic:'1.10 Systems of Linear Equations', keywords:['elimination','substitution','solving systems'] }
];

(function(){
  var input = document.getElementById('global-search');
  var dropdown = document.getElementById('global-search-dropdown');
  if(!input || !dropdown) return;

  var currentResults = [];
  var activeIndex = -1;

  function scoreEntry(entry, q){
    var title = entry.title.toLowerCase();
    if(title.indexOf(q) === 0) return 3;
    if(title.indexOf(q) !== -1) return 2;
    var rest = (entry.subtopic + ' ' + entry.keywords.join(' ')).toLowerCase();
    if(rest.indexOf(q) !== -1) return 1;
    return 0;
  }

  function search(q){
    q = q.trim().toLowerCase();
    if(!q) return [];
    var scored = SEARCH_INDEX.map(function(entry){ return { entry: entry, score: scoreEntry(entry, q) }; })
      .filter(function(r){ return r.score > 0; })
      .sort(function(a, b){ return b.score - a.score; })
      .slice(0, 8)
      .map(function(r){ return r.entry; });
    return scored;
  }

  function render(results){
    currentResults = results;
    activeIndex = -1;
    if(!results.length){
      dropdown.innerHTML = '<div class="gsr-empty">No matching topics — try a different term.</div>';
      dropdown.classList.add('show');
      return;
    }
    dropdown.innerHTML = results.map(function(entry, i){
      return '' +
        '<div class="gsr-row" data-index="' + i + '">' +
          '<div class="gsr-row-text">' +
            '<span class="gsr-title">' + entry.title + '</span>' +
            '<span class="gsr-subtopic">' + entry.subtopic + '</span>' +
          '</div>' +
          '<div class="gsr-actions">' +
            '<a class="gsr-pill" href="maths-notes.html#note=' + entry.subsub + '">Notes</a>' +
            '<a class="gsr-pill" href="maths-question-bank.html#qb=' + entry.subsub + '">Practice</a>' +
          '</div>' +
        '</div>';
    }).join('');
    dropdown.classList.add('show');
  }

  function close(){
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
    currentResults = [];
    activeIndex = -1;
  }

  function updateActive(){
    var rows = dropdown.querySelectorAll('.gsr-row');
    rows.forEach(function(row, i){ row.classList.toggle('is-active', i === activeIndex); });
    if(activeIndex >= 0 && rows[activeIndex]) rows[activeIndex].scrollIntoView({ block:'nearest' });
  }

  input.addEventListener('input', function(){ render(search(input.value)); });

  input.addEventListener('focus', function(){ if(input.value.trim()) render(search(input.value)); });

  input.addEventListener('keydown', function(e){
    if(!dropdown.classList.contains('show')) return;
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, currentResults.length - 1);
      updateActive();
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive();
    } else if(e.key === 'Enter'){
      var target = currentResults[activeIndex >= 0 ? activeIndex : 0];
      if(target){
        e.preventDefault();
        window.location.href = 'maths-notes.html#note=' + target.subsub;
      }
    } else if(e.key === 'Escape'){
      close();
      input.blur();
    }
  });

  dropdown.addEventListener('mouseover', function(e){
    var row = e.target.closest('.gsr-row');
    if(!row) return;
    activeIndex = Number(row.getAttribute('data-index'));
    updateActive();
  });

  document.addEventListener('click', function(e){
    if(!dropdown.contains(e.target) && e.target !== input) close();
  });
})();
