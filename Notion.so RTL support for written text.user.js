// ==UserScript==
// @name         Notion.so RTL support for written text
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Add support for writing RTL text blocks (including todo list, bullet list, headings, etc.) and dynamically adjust the page direction to RTL if needed. This script changes text direction automatically depending on the language of the first letter in a text block. Helpful for writing in RTL languages. English text remains unaffected.
// @author       OrenK
// @include      https://www.notion.so/*
// @grant        none
// @downloadURL https://update.greasyfork.org/scripts/398348/Notionso%20RTL%20support%20for%20written%20text.user.js
// @updateURL https://update.greasyfork.org/scripts/398348/Notionso%20RTL%20support%20for%20written%20text.meta.js
// ==/UserScript==

(function() {
    'use strict';

    var GM_addStyle =
        function(css) {
            var style = document.getElementById("GM_addStyleBy8626") || (function() {
                var style = document.createElement('style');
                style.type = 'text/css';
                style.id = "GM_addStyleBy8626";
                document.head.appendChild(style);
                return style;
            })();
            var sheet = style.sheet;
            sheet.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
        };

    GM_addStyle(".notion-selectable * { text-align: start !important; }");
    GM_addStyle(".notion-selectable.notion-to_do-block > div > div:nth-of-type(2) { margin-right: 4px !important; }");

    var blackListClasses = ['notion-collection-item', 'notion-collection_view-block'];

    // Utility to check if an element contains certain classes
    var containsClasses = function(element, classesNames) {
        for (var index = 0; index < classesNames.length; index++) {
            if (element.classList.contains(classesNames[index])) {
                return true;
            }
        }
        return false;
    };

    // Determine the direction based on the first strong directional character
    var determinePageDirection = function() {
        var notionPage = document.querySelector('.notion-page-content');
        if (notionPage) {
            var textContent = notionPage.innerText.trim();
            var rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
            var isRTL = rtlChars.test(textContent);
            document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        }
    };

    // Callback for handling mutations on Notion content
    var notionPageCallback = function(mutations) {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(addedNode => {
                if (addedNode.nodeType === Node.ELEMENT_NODE) {
                    if (addedNode.tagName === 'DIV' && addedNode.classList.contains('notion-selectable') && !containsClasses(addedNode, blackListClasses)) {
                        addedNode.setAttribute('dir', 'auto');
                    }
                    Array.from(addedNode.getElementsByClassName('notion-selectable')).forEach(child => {
                        if (!containsClasses(child, blackListClasses)) {
                            child.setAttribute('dir', 'auto');
                        }
                    });
                }
            });
        });
        determinePageDirection(); // Reevaluate page direction on mutation
    };

    // Observer for Notion pages
    var notionPagesWeakMap = new WeakMap();
    var documentCallback = function() {
        var notionPages = document.getElementsByClassName('notion-page-content');
        for (var notionPage of notionPages) {
            if (!notionPagesWeakMap.has(notionPage)) {
                Array.from(notionPage.getElementsByClassName('notion-selectable')).forEach(divElement => {
                    if (!containsClasses(divElement, blackListClasses)) {
                        divElement.setAttribute('dir', 'auto');
                    }
                });
                var pageObserver = new MutationObserver(notionPageCallback);
                pageObserver.observe(notionPage, { subtree: true, childList: true });
                notionPagesWeakMap.set(notionPage, pageObserver);
            }
        }
        determinePageDirection(); // Initial evaluation of page direction
    };

    var documentObserver = new MutationObserver(documentCallback);

    // Start observing the document for changes
    documentObserver.observe(document, { subtree: true, childList: true });

    // Initial check
    determinePageDirection();
})();
