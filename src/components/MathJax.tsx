import TeXToSVG from "tex-to-svg";
import React from "react";

/**
 * Converts a Tex string into a SVG elements.
 *
 * @param tex The Tex string to be converted and displayed.
 * @constructor
 */
export default function MathJax({tex}: {tex: string}) {
    return <div dangerouslySetInnerHTML={{__html: TeXToSVG(tex)}} />;
}