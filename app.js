(function () {
  "use strict";
  var DATA = window.CURRICULUM;

  var state = {
    lang: localStorage.getItem("wps_lang") || "en",
    termId: parseInt(localStorage.getItem("wps_term"), 10) || DATA.terms[0].id,
    sel: null, // currently open skill modal: { skill, areaName, groupName, color, tint }
  };

  var UI = {
    en: {
      kicker: "Welgemoed Pre-Primary",
      heroTitle: "Our Grade R Curriculum Journey",
      heroSub: "A friendly look at the skills every Grade R child works on across the school year — organised term by term. Tap any skill to learn more.",
      statTerm: "Term",
      statAreas: "Learning areas",
      statGroups: "Focus groups",
      statSkills: "Milestones",
      footer: "Every little skill is a step as our Grade R learners keep growing",
      close: "Close",
    },
    af: {
      kicker: "Welgemoed Pre-Primêr",
      heroTitle: "Ons Graad R Kurrikulumreis",
      heroSub: "'n Vriendelike oorsig van die vaardighede waaraan elke Graad R-kind deur die skooljaar werk — kwartaal vir kwartaal georden. Tik op enige vaardigheid om meer te leer.",
      statTerm: "Kwartaal",
      statAreas: "Leergebiede",
      statGroups: "Fokusgroepe",
      statSkills: "Mylpale",
      footer: "Elke klein vaardigheid is 'n stap terwyl ons Graad R-leerders steeds groei",
      close: "Maak toe",
    },
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function currentTerm() {
    return DATA.terms.find(function (t) { return t.id === state.termId; }) || DATA.terms[0];
  }

  function termStats(term) {
    var areas = term.areas.length;
    var groups = 0, skills = 0;
    term.areas.forEach(function (a) {
      groups += a.groups.length;
      a.groups.forEach(function (g) { skills += g.skills.length; });
    });
    return { areas: areas, groups: groups, skills: skills };
  }

  function render() {
    var lang = state.lang;
    var t = UI[lang];
    var term = currentTerm();
    var stats = termStats(term);
    var root = document.getElementById("app");

    var tabsHtml = DATA.terms.map(function (tm) {
      var active = tm.id === state.termId ? " active" : "";
      return '<button type="button" class="tab-btn' + active + '" data-term="' + tm.id + '">' + esc(tm.label[lang]) + "</button>";
    }).join("");

    var areasHtml = term.areas.map(function (area) {
      var meta = DATA.areaMeta[area.key];
      var groupsHtml = area.groups.map(function (group) {
        var skillsHtml = group.skills.map(function (skill, si) {
          return (
            '<button type="button" class="skill-card" style="background:' + meta.tint + '" ' +
            'data-area="' + esc(meta.name[lang]) + '" data-group="' + esc(group.name[lang]) + '" ' +
            'data-color="' + meta.color + '" data-tint="' + meta.tint + '" ' +
            'data-text="' + esc(skill.t[lang]) + '" data-desc="' + esc(skill.d[lang]) + '" data-icon="' + esc(skill.icon) + '">' +
              '<span class="skill-icon">' + skill.icon + "</span>" +
              '<span class="skill-text">' + esc(skill.t[lang]) + "</span>" +
              '<span class="skill-chevron" style="color:' + meta.color + '">›</span>' +
            "</button>"
          );
        }).join("");
        return (
          '<div class="group-card">' +
            '<div class="group-head"><span class="group-dot" style="background:' + meta.color + '"></span>' +
            "<h3>" + esc(group.name[lang]) + "</h3></div>" +
            '<div class="skill-grid">' + skillsHtml + "</div>" +
          "</div>"
        );
      }).join("");

      return (
        '<section class="area-section">' +
          '<div class="area-head" style="background:' + meta.color + '">' +
            '<span class="area-emoji">' + meta.emoji + "</span>" +
            "<div><h2>" + esc(meta.name[lang]) + "</h2></div>" +
          "</div>" +
          groupsHtml +
        "</section>"
      );
    }).join("");

    var modalHtml = "";
    if (state.sel) {
      var s = state.sel;
      modalHtml =
        '<div class="modal-overlay" id="modalOverlay">' +
          '<div class="modal-card">' +
            '<button type="button" class="modal-close" id="modalClose" aria-label="' + esc(t.close) + '">×</button>' +
            '<div class="modal-header" style="background:' + s.color + '">' +
              '<span class="modal-icon">' + s.icon + "</span>" +
              '<div class="modal-crumb">' + esc(s.areaName) + " · " + esc(s.groupName) + "</div>" +
            "</div>" +
            '<div class="modal-body"><h3 class="modal-title">' + esc(s.text) + "</h3>" +
              '<p class="modal-desc">' + esc(s.desc) + "</p></div>" +
          "</div>" +
        "</div>";
    }

    root.innerHTML =
      '<header class="topbar">' +
        '<div class="topbar-inner">' +
          '<div class="brand"><span class="brand-emoji">🎓</span><span>' + esc(DATA.school[lang]) + "</span></div>" +
          '<nav class="tabs">' + tabsHtml + "</nav>" +
          '<div class="lang-toggle">' +
            '<button type="button" class="lang-btn' + (lang === "en" ? " active" : "") + '" data-lang="en">EN</button>' +
            '<button type="button" class="lang-btn' + (lang === "af" ? " active" : "") + '" data-lang="af">AF</button>' +
          "</div>" +
        "</div>" +
      "</header>" +
      '<main class="page">' +
        '<div class="hero">' +
          '<div class="hero-emojis"><span>🎓</span><span>🏫</span><span>🌟</span></div>' +
          '<div class="kicker">' + esc(t.kicker) + " · " + esc(DATA.grade[lang]) + "</div>" +
          "<h1>" + esc(t.heroTitle) + "</h1>" +
          "<p class=\"hero-sub\">" + esc(t.heroSub) + "</p>" +
          '<div class="stat-row">' +
            statPill("📅", esc(t.statTerm) + " " + term.id, "oklch(0.5 0.13 30)", "oklch(0.95 0.035 40)") +
            statPill("📚", stats.areas + " " + esc(t.statAreas), "oklch(0.48 0.13 245)", "oklch(0.95 0.03 245)") +
            statPill("🗂️", stats.groups + " " + esc(t.statGroups), "oklch(0.5 0.13 30)", "oklch(0.95 0.035 40)") +
            statPill("🌱", stats.skills + " " + esc(t.statSkills), "oklch(0.46 0.13 150)", "oklch(0.95 0.035 150)") +
          "</div>" +
        "</div>" +
        areasHtml +
        '<p class="page-footer">🌟 ' + esc(t.footer) + " · " + esc(term.label[lang]) + " 🌟</p>" +
      "</main>" +
      modalHtml;
  }

  function statPill(icon, label, color, tint) {
    return (
      '<div class="stat-pill" style="background:' + tint + '">' +
        '<span class="stat-icon">' + icon + "</span>" +
        '<span class="stat-label" style="color:' + color + '">' + label + "</span>" +
      "</div>"
    );
  }

  document.addEventListener("click", function (e) {
    var tabBtn = e.target.closest(".tab-btn");
    if (tabBtn) {
      state.termId = parseInt(tabBtn.getAttribute("data-term"), 10);
      localStorage.setItem("wps_term", state.termId);
      state.sel = null;
      render();
      return;
    }
    var langBtn = e.target.closest(".lang-btn");
    if (langBtn) {
      state.lang = langBtn.getAttribute("data-lang");
      localStorage.setItem("wps_lang", state.lang);
      render();
      return;
    }
    var skillBtn = e.target.closest(".skill-card");
    if (skillBtn) {
      state.sel = {
        icon: skillBtn.getAttribute("data-icon"),
        text: skillBtn.getAttribute("data-text"),
        desc: skillBtn.getAttribute("data-desc"),
        areaName: skillBtn.getAttribute("data-area"),
        groupName: skillBtn.getAttribute("data-group"),
        color: skillBtn.getAttribute("data-color"),
        tint: skillBtn.getAttribute("data-tint"),
      };
      render();
      return;
    }
    if (e.target.id === "modalOverlay" || e.target.id === "modalClose") {
      state.sel = null;
      render();
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.sel) {
      state.sel = null;
      render();
    }
  });

  render();
})();
