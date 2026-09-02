/* ==========================================================================
   CodeQuest — interactions
   Vanilla JS only. GPU-friendly (transform/opacity). Respects reduced motion.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  /* -------------------- Mobile nav -------------------- */
  var navToggle = document.getElementById('navToggle');
  var navMobile = document.getElementById('navMobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMobile.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navMobile.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMobile.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -------------------- Cursor glow (desktop only) -------------------- */
  var glow = document.getElementById('cursorGlow');
  if (glow && !isCoarsePointer && !reduceMotion) {
    var targetX = -1000, targetY = -1000;
    var rafId = null;

    function updateGlow() {
      glow.style.transform = 'translate3d(' + targetX + 'px, ' + targetY + 'px, 0)';
      rafId = null;
    }

    window.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(updateGlow);
    }, { passive: true });
  } else if (glow) {
    glow.style.display = 'none';
  }

  /* -------------------- Scroll reveal -------------------- */
  var revealTargets = document.querySelectorAll(
    '.stat, .loop-step, .editor-grid, .dash-panel, .section-head, .feature-index li'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealTargets.forEach(function (el) { revealObserver.observe(el); });

  /* -------------------- Path row reveal (staggered) -------------------- */
  var pathRows = document.querySelectorAll('.path-row');
  var pathObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var index = Array.prototype.indexOf.call(pathRows, entry.target);
          entry.target.style.transitionDelay = reduceMotion ? '0ms' : (index * 70) + 'ms';
          entry.target.classList.add('in-view');
          pathObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  pathRows.forEach(function (el) { pathObserver.observe(el); });

  /* -------------------- Progress bar fill on view -------------------- */
  var dashPanel = document.querySelector('.dash-panel');
  var barsAnimated = false;

  function animateBars() {
    if (barsAnimated) return;
    barsAnimated = true;

    var levelFill = document.querySelector('.level-fill');
    if (levelFill) {
      var target = levelFill.getAttribute('data-target') || '0';
      requestAnimationFrame(function () { levelFill.style.width = target + '%'; });
    }
    document.querySelectorAll('.skill-fill').forEach(function (fill) {
      var target = fill.getAttribute('data-target') || '0';
      requestAnimationFrame(function () { fill.style.width = target + '%'; });
    });
  }

  if (dashPanel) {
    var barsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateBars();
            barsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    barsObserver.observe(dashPanel);
  }

  /* -------------------- Lightweight "typing" code reveal -------------------- */
  var editorCode = document.querySelector('#editorCode code');
  var codeLines = [
    { html: '<span class="kw">function</span> <span class="fn">startJourney</span>() {', indent: 0 },
    { html: '<span class="kw">const</span> developer = <span class="kw">new</span> Developer();', indent: 1 },
    { html: '', indent: 1 },
    { html: 'developer.learn();', indent: 1 },
    { html: 'developer.practice();', indent: 1 },
    { html: 'developer.build();', indent: 1 },
    { html: '', indent: 1 },
    { html: '<span class="kw">return</span> developer.levelUp();', indent: 1 },
    { html: '}', indent: 0 }
  ];

  var editorTyped = false;

  function typeEditor() {
    if (editorTyped || !editorCode) return;
    editorTyped = true;

    if (reduceMotion) {
      editorCode.innerHTML = codeLines.map(function (l) { return '  '.repeat(l.indent) + l.html; }).join('\n');
      return;
    }

    var lineIndex = 0;
    function nextLine() {
      if (lineIndex >= codeLines.length) {
        var cursor = document.createElement('span');
        cursor.className = 'cursor';
        editorCode.appendChild(cursor);
        return;
      }
      var line = codeLines[lineIndex];
      var prefix = editorCode.textContent.length ? '\n' : '';
      editorCode.innerHTML += prefix + '  '.repeat(line.indent) + line.html;
      lineIndex++;
      setTimeout(nextLine, 140);
    }
    nextLine();
  }

  var editorSection = document.querySelector('.editor-section');
  if (editorSection) {
    var editorObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            typeEditor();
            editorObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    editorObserver.observe(editorSection);
  }
  /* -------------------- Profile & Theme Toggle -------------------- */
  var profileBtn = document.getElementById('profileBtn');
  var profileDropdown = document.getElementById('profileDropdown');
  var themeToggle = document.getElementById('themeToggle');

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      profileDropdown.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove('open');
      }
    });
  }

  if (themeToggle) {
    // Check saved theme or default to light (since we updated variables)
    var savedTheme = localStorage.getItem('cq-theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('cq-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('cq-theme', 'light');
      }
    });
  }
})();
