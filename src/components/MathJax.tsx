import TeXToSVG from "tex-to-svg";
import React from "react";

export default function MathJax({tex}: {tex: string}) {
    return <div dangerouslySetInnerHTML={{__html: TeXToSVG(tex)}} />;
}