/* ==========================================================
   BAF Shaheen College Chattogram — homepage behaviour
   1. Theme toggle   2. Mobile menu   3. History slider
   4. Newsletter form validation   5. Missing-image handling
========================================================== */

(function () {
    "use strict";

    var root = document.documentElement;
    var THEME_KEY = "baf-theme";
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");


    /* ======================================================
       1. THEME
    ====================================================== */

    function readStoredTheme() {
        try {
            var value = localStorage.getItem(THEME_KEY);
            return value === "light" || value === "dark" ? value : null;
        } catch (e) {
            return null;
        }
    }

    function storeTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) { /* storage unavailable: theme still applies this visit */ }
    }

    var themeButton = document.getElementById("themeToggle");

    function applyTheme(theme, animate) {
        if (animate && !reducedMotion.matches) {
            root.classList.add("theme-animating");
            window.setTimeout(function () {
                root.classList.remove("theme-animating");
            }, 300);
        }

        root.setAttribute("data-theme", theme);

        if (themeButton) {
            themeButton.setAttribute(
                "aria-label",
                theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            );
        }
    }

    function currentTheme() {
        return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    applyTheme(readStoredTheme() || (darkQuery.matches ? "dark" : "light"), false);

    if (themeButton) {
        themeButton.addEventListener("click", function () {
            var next = currentTheme() === "dark" ? "light" : "dark";
            applyTheme(next, true);
            storeTheme(next);
        });
    }

    /* Follow the system setting only while the user has no saved choice */
    function onSystemThemeChange(event) {
        if (!readStoredTheme()) {
            applyTheme(event.matches ? "dark" : "light", true);
        }
    }

    if (darkQuery.addEventListener) {
        darkQuery.addEventListener("change", onSystemThemeChange);
    } else if (darkQuery.addListener) {
        darkQuery.addListener(onSystemThemeChange);
    }

    /* Back/forward cache and other tabs */
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
            applyTheme(readStoredTheme() || currentTheme(), false);
        }
    });

    window.addEventListener("storage", function (event) {
        if (event.key === THEME_KEY && (event.newValue === "light" || event.newValue === "dark")) {
            applyTheme(event.newValue, true);
        }
    });


    /* ======================================================
       2. MOBILE MENU
    ====================================================== */

    var menuButton = document.querySelector(".mobile-menu");
    var navMenu = document.getElementById("primary-nav");
    var desktopNav = window.matchMedia("(min-width: 75rem)");

    function setMenu(open, returnFocus) {
        if (!menuButton || !navMenu) { return; }

        navMenu.classList.toggle("show", open);
        menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");

        if (!open && returnFocus) { menuButton.focus(); }
    }

    if (menuButton && navMenu) {
        menuButton.addEventListener("click", function () {
            setMenu(menuButton.getAttribute("aria-expanded") !== "true");
        });

        navMenu.addEventListener("click", function (event) {
            if (event.target.closest("a")) { setMenu(false); }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" &&
                menuButton.getAttribute("aria-expanded") === "true") {
                setMenu(false, true);
            }
        });

        document.addEventListener("click", function (event) {
            if (menuButton.getAttribute("aria-expanded") === "true" &&
                !event.target.closest(".header")) {
                setMenu(false);
            }
        });

        var onDesktopChange = function (event) {
            if (event.matches) { setMenu(false); }
        };

        if (desktopNav.addEventListener) {
            desktopNav.addEventListener("change", onDesktopChange);
        } else if (desktopNav.addListener) {
            desktopNav.addListener(onDesktopChange);
        }
    }


    /* ======================================================
       3. HISTORY SLIDER
    ====================================================== */

    var mainImage = document.getElementById("historySliderImage");
    var dots = Array.prototype.slice.call(document.querySelectorAll(".history-dot"));
    var middleImage = document.querySelector(".history-card-middle img");
    var backImage = document.querySelector(".history-card-back img");
    var toggleButton = document.getElementById("historyToggle");
    var cycleBox = document.getElementById("autoCycle");
    var cycleText = document.getElementById("autoCycleText");

    if (mainImage && dots.length) {
        var sources = dots.map(function (dot) { return dot.getAttribute("data-image"); });
        var total = sources.length;
        var current = 0;
        var timer = null;
        var fadeTimer = null;
        var userPaused = reducedMotion.matches; /* no autoplay if motion is reduced */
        var INTERVAL = 4000;

        var setPreviews = function (index) {
            if (middleImage) { middleImage.src = sources[(index + 1) % total]; }
            if (backImage) { backImage.src = sources[(index + 2) % total]; }
        };

        var showImage = function (index) {
            index = (index + total) % total;
            current = index;

            dots.forEach(function (dot, i) {
                var active = i === index;
                dot.classList.toggle("active", active);
                if (active) {
                    dot.setAttribute("aria-current", "true");
                } else {
                    dot.removeAttribute("aria-current");
                }
            });

            window.clearTimeout(fadeTimer);

            var swap = function () {
                mainImage.classList.remove("is-missing");
                mainImage.onload = mainImage.onerror = function () {
                    mainImage.classList.remove("changing");
                };
                mainImage.src = sources[index];
                mainImage.alt = "Bangladesh Air Force Shaheen College Chattogram, photo " +
                    (index + 1) + " of " + total;
                setPreviews(index);
            };

            if (reducedMotion.matches) {
                swap();
            } else {
                mainImage.classList.add("changing");
                fadeTimer = window.setTimeout(swap, 300);
            }
        };

        var stopTimer = function () {
            window.clearInterval(timer);
            timer = null;
        };

        var startTimer = function () {
            stopTimer();
            if (userPaused || document.hidden) { return; }
            timer = window.setInterval(function () {
                showImage(current + 1);
            }, INTERVAL);
        };

        var updateStatus = function () {
            if (cycleBox) { cycleBox.classList.toggle("is-paused", userPaused); }
            if (cycleText) {
                cycleText.textContent = userPaused ? "Auto cycle paused" : "Auto cycle active";
            }
            if (toggleButton) {
                toggleButton.textContent = userPaused ? "Play" : "Pause";
                toggleButton.setAttribute(
                    "aria-label",
                    userPaused ? "Play photo slideshow" : "Pause photo slideshow"
                );
            }
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showImage(index);
                startTimer(); /* restart the countdown after manual navigation */
            });
        });

        if (toggleButton) {
            toggleButton.addEventListener("click", function () {
                userPaused = !userPaused;
                updateStatus();
                startTimer();
            });
        }

        document.addEventListener("visibilitychange", startTimer);

        setPreviews(0);
        updateStatus();
        startTimer();
    }


    /* ======================================================
       4. NEWSLETTER (frontend validation only — no backend)
    ====================================================== */

    var newsletterForm = document.getElementById("newsletterForm");
    var newsletterEmail = document.getElementById("newsletterEmail");
    var newsletterMessage = document.getElementById("newsletterMessage");

    if (newsletterForm && newsletterEmail && newsletterMessage) {
        newsletterForm.addEventListener("submit", function (event) {
            event.preventDefault();

            var value = newsletterEmail.value.trim();
            var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

            newsletterMessage.classList.remove("is-error", "is-info");

            if (!valid) {
                newsletterEmail.setAttribute("aria-invalid", "true");
                newsletterMessage.classList.add("is-error");
                newsletterMessage.textContent = value
                    ? "Please enter a valid email address."
                    : "Please enter your email address.";
                newsletterEmail.focus();
                return;
            }

            newsletterEmail.removeAttribute("aria-invalid");
            newsletterMessage.classList.add("is-info");
            newsletterMessage.textContent =
                "Email format looks good, but newsletter sign-up is not connected yet, so nothing was submitted.";
        });

        newsletterEmail.addEventListener("input", function () {
            newsletterEmail.removeAttribute("aria-invalid");
        });
    }


    /* ======================================================
       5. MISSING IMAGES — fail quietly, keep layout stable
    ====================================================== */

    Array.prototype.forEach.call(document.images, function (img) {
        var markMissing = function () { img.classList.add("is-missing"); };

        if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) {
            markMissing();
        }
        img.addEventListener("error", markMissing);
        img.addEventListener("load", function () {
            img.classList.remove("is-missing");
        });
    });

})();
