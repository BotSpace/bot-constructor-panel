import Script from "next/script";
import React from "react";

type Props = {};

function Analytics({}: Props) {
  return (
    <>
      <Script
        src="https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.23.2-min.js.gz"
        strategy="beforeInteractive"
      />

      {/* For Amplitude session replay */}
      <Script
        id="amplitude-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
              window.amplitude.init('583cf39184ae29a8d3a606f2047cce85', {"autocapture":{"elementInteractions":true}});
            `,
        }}
      />
    </>
  );
}

export default Analytics;
