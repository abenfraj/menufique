"use client";

import { useRef, useEffect, useState } from "react";
import { TemplateData } from "../types";
import { ClassicTemplate } from "../classic/template";

function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\bon\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript\s*:/gi, "");
}

// Script injected into iframe to report height to parent
const HEIGHT_REPORTER = `
<script>
  function reportHeight() {
    var h = document.body ? document.body.scrollHeight : 800;
    window.parent.postMessage({ type: 'menuHeight', height: h }, '*');
  }
  window.addEventListener('load', function() {
    reportHeight();
    setTimeout(reportHeight, 500);
    setTimeout(reportHeight, 1500);
  });
  new MutationObserver(reportHeight).observe(document.body, { childList: true, subtree: true });
</script>
`;

export function AiCustomTemplate({ data }: { data: TemplateData }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(800);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "menuHeight" && typeof e.data.height === "number") {
        setIframeHeight(Math.max(e.data.height, 300));
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!data.aiDesignHtml) {
    return <ClassicTemplate data={data} />;
  }

  const cleanHtml = sanitizeHtml(data.aiDesignHtml);

  // Inject height reporter before </body> or at end
  let htmlWithReporter = cleanHtml;
  if (cleanHtml.includes("</body>")) {
    htmlWithReporter = cleanHtml.replace("</body>", HEIGHT_REPORTER + "</body>");
  } else {
    htmlWithReporter = cleanHtml + HEIGHT_REPORTER;
  }

  return (
    <iframe
      ref={iframeRef}
      srcDoc={htmlWithReporter}
      title="Aperçu du menu IA"
      style={{
        width: "100%",
        height: iframeHeight,
        border: "none",
        display: "block",
      }}
      sandbox="allow-same-origin allow-scripts"
    />
  );
}
