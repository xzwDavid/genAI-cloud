import React from "react";

/** Cache the style of a specified element */
export default class StyleCacher {
    // ==============================
    // Variables
    // ==============================
    /** reference to the element */
    elem: HTMLElement;
    /** Cached style */
    style: CSSStyleDeclaration;

    // ==============================
    // Constructor
    // ==============================
    constructor (elem: HTMLElement) {
        this.elem = elem;
        this.style = JSON.parse(JSON.stringify(elem.style));
        // console.log(this.style); /* only shows inline-style */
    }

    // ==============================
    // Functions
    // ==============================
    /** Restore display style back to same as initialized stage */
    restoreDisplay() {
        this.elem.style.display = this.style.display;
        // console.log(this.style.display);
    }
}