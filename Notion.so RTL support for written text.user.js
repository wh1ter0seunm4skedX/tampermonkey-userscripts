// ==UserScript==
// @name         Notion RTL
// @namespace    http://tampermonkey.net/
// @author       MichaelB
// @version      1.0
// @description  Instantly set dir="auto" on Notion blocks & title, so Hebrew text flows RTL without delay.
// @match        https://www.notion.so/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  /************************************************************
   * 1) Inject some CSS to align text properly from the start.
   ************************************************************/
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    /* Make .notion-selectable text follow the direction set by dir="auto" */
    .notion-selectable * {
      text-align: start !important;
    }

    /* Force the Notion title area to also use auto direction */
    .notion-header, .notion-header *,
    .notion-title,  .notion-title *,
    .notion-page-block div[placeholder="Untitled"] {
      direction: auto !important;
      text-align: start !important;
    }
  `;
  document.head.appendChild(styleEl);

  /************************************************************
   * 2) A helper to set `dir="auto"` on a newly added node (and its children).
   ************************************************************/
  function applyAutoDirToNode(node) {
    // If it's a .notion-selectable block, set dir="auto"
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node.classList &&
      node.classList.contains('notion-selectable')
    ) {
      node.setAttribute('dir', 'auto');
    }

    // For any child .notion-selectable elements
    const childSelectables = node.querySelectorAll?.('.notion-selectable') || [];
    childSelectables.forEach(child => {
      child.setAttribute('dir', 'auto');
    });

    // If it matches a known title container, also set `dir="auto"`
    // (In case your environment needs it set explicitly.)
    if (node.matches?.('.notion-header, .notion-title, .notion-header *, .notion-title *')) {
      node.setAttribute('dir', 'auto');
    }
    if (node.matches?.('div[placeholder="Untitled"]')) {
      node.setAttribute('dir', 'auto');
    }
  }

  /************************************************************
   * 3) Global MutationObserver callback: watch for *all* new nodes.
   ************************************************************/
  function globalMutationCallback(mutationsList) {
    for (const mutation of mutationsList) {
      // For newly added nodes
      mutation.addedNodes.forEach(addedNode => {
        applyAutoDirToNode(addedNode);
      });

      // If the mutation is, e.g., characterData changed, or
      // subtree changes that can re-render text, you could also
      // check the target node:
      if (mutation.type === 'characterData') {
        applyAutoDirToNode(mutation.target.parentNode);
      }
    }
  }

  /************************************************************
   * 4) Start observing *the entire document* for changes.
   ************************************************************/
  const observer = new MutationObserver(globalMutationCallback);
  observer.observe(document, {
    subtree: true,
    childList: true,
    characterData: true
  });

  /************************************************************
   * 5) On initial load, also immediately set dir="auto" for
   *    any existing .notion-selectable blocks and title elements.
   ************************************************************/
  document.querySelectorAll('.notion-selectable').forEach(el => {
    el.setAttribute('dir', 'auto');
  });
  document.querySelectorAll('.notion-header, .notion-title, div[placeholder="Untitled"]').forEach(el => {
    el.setAttribute('dir', 'auto');
  });
})();
