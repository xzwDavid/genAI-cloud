/** Utility class which provides a bunch of general functions */
export default class Utility {
    
    /** Get only the top level innerHTML from an element 
     * @param elem div, button, input, etc.
     * @returns text from the highest level
    */
    static getToplevelText(elem: HTMLElement) {
        var child = elem.firstChild, texts = [];
        while (child) {
            if (child.nodeType === 3) texts.push(child.textContent);
            child = child.nextSibling;
        }
        return texts.join("")
    }

    /**
     * Get a random integer ranging from min to max
     * @param min smallest number
     * @param max largest number
     * @returns a random number (integer)
     */
    static getRandIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}