import { ScrollViewStyleReset } from 'expo-router/html';

import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6200ee" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Trading Journal" />
        <ScrollViewStyleReset />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var MAX_RELOADS = 2;
                var reloadCount = Number(
                  sessionStorage.getItem('tj_sw_failure_reload_count') || '0'
                );

                function showReloadUI(message) {
                  var root = document.createElement('div');
                  root.id = 'tj-sw-failure-ui';
                  root.style.cssText =
                    'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#fff;color:#212121;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:24px;text-align:center;';
                  root.innerHTML =
                    '<div style="max-width:400px;">' +
                    '<h1 style="font-size:22px;font-weight:600;margin-bottom:12px;">Update required</h1>' +
                    '<p style="font-size:15px;line-height:1.6;color:#757575;margin-bottom:24px;">' +
                    (message || 'The app could not load the latest version.') +
                    '</p>' +
                    '<button id="tj-sw-reload-btn" style="background:#6200ee;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:15px;font-weight:500;cursor:pointer;">Reload</button>' +
                    '</div>';
                  document.body.appendChild(root);
                  document
                    .getElementById('tj-sw-reload-btn')
                    .addEventListener('click', function () {
                      sessionStorage.removeItem('tj_sw_failure_reload_count');
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker
                          .getRegistrations()
                          .then(function (registrations) {
                            return Promise.all(
                              registrations.map(function (r) {
                                return r.unregister();
                              })
                            );
                          })
                          .then(function () {
                            window.location.reload();
                          })
                          .catch(function () {
                            window.location.reload();
                          });
                      } else {
                        window.location.reload();
                      }
                    });
                }

                window.addEventListener('error', function (event) {
                  var target = event.target;
                  if (
                    target &&
                    target.tagName === 'SCRIPT' &&
                    target.src &&
                    target.src.indexOf('/_expo/static/js/web/entry-') !== -1
                  ) {
                    if (reloadCount < MAX_RELOADS) {
                      sessionStorage.setItem(
                        'tj_sw_failure_reload_count',
                        String(reloadCount + 1)
                      );
                      window.location.reload();
                    } else {
                      showReloadUI(
                        'A cached version of the app is trying to load files that no longer exist.'
                      );
                    }
                  }
                },
                true);

                window.addEventListener('unhandledrejection', function (event) {
                  var reason = event.reason;
                  if (
                    reason &&
                    reason.message &&
                    reason.message.indexOf('Loading chunk') !== -1 &&
                    reloadCount < MAX_RELOADS
                  ) {
                    sessionStorage.setItem(
                      'tj_sw_failure_reload_count',
                      String(reloadCount + 1)
                    );
                    window.location.reload();
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
