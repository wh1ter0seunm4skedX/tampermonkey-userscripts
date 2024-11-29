// ==UserScript==
// @name         Flip Direction Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add a button to flip page direction between RTL and LTR
// @author       DragonArab
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // CSS Styles
    GM_addStyle(`
        .flip-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: rgba(255, 255, 255, 0.8);
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(8px);
        }
        .flip-button {
            font-size: 16px;
            font-weight: bold;
            padding: 12px 16px;
            border: none;
            color: white;
            border-radius: 30px;
            cursor: pointer;
            outline: none;
            transition: all 0.3s ease;
            background: linear-gradient(45deg, #3b82f6, #2563eb);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .flip-button:hover {
            background: linear-gradient(45deg, #2563eb, #1d4ed8);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
            transform: translateY(-2px) scale(1.05);
        }
        .credits {
            font-size: 12px;
            color: #444;
            text-align: center;
            margin-top: 10px;
            font-family: 'Arial', sans-serif;
        }
    `);

    // Create container div
    const container = document.createElement('div');
    container.className = 'flip-container';

    // Create button
    const flipButton = document.createElement('button');
    flipButton.className = 'flip-button';
    flipButton.innerText = 'RTL';

    // Append elements
    container.appendChild(flipButton);
    document.body.appendChild(container);

    // Toggle direction
    let isRTL = false;
    flipButton.addEventListener('click', () => {
        isRTL = !isRTL;
        document.body.style.direction = isRTL ? 'rtl' : 'ltr';
        flipButton.innerText = isRTL ? 'LTR' : 'RTL';
    });
})();
