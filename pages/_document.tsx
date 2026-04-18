// ============================================================
//  ISSUE #2 — Frontend UI & Dashboard
//  _document.tsx equivalent — Structural placeholder
//  Note: In Vite, index.html serves this role. This file is added
//  strictly to match the Next.js architectural tree layout spec.
// ============================================================

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
