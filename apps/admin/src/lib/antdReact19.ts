/**
 * React 19 compatibility for Ant Design v5 static APIs.
 *
 * antd's static `message.*`, `notification.*` and `Modal.confirm/warning/info/...`
 * render through `unstableSetRender`, whose default implementation falls back to
 * the legacy `ReactDOM.render`. React 19 removed `ReactDOM.render` (and
 * `ReactDOM.createRoot`; `createRoot` now lives in `react-dom/client`), so those
 * static calls silently render nothing.
 *
 * The effect on this app was severe and easy to misdiagnose:
 *   • every `message.success` / `message.error` toast was a no-op;
 *   • every bulk-delete flow opens a confirmation via `Modal.confirm`, so the
 *     confirmation never appeared and the delete request was never sent.
 *
 * Registering a `createRoot`-based renderer restores the static APIs. This is
 * the same mechanism used by `@ant-design/v5-patch-for-react-19`.
 */
import { unstableSetRender } from "antd";
import { createRoot } from "react-dom/client";

type Root = ReturnType<typeof createRoot>;
type RootContainer = (Element | DocumentFragment) & { _reactRoot?: Root };

unstableSetRender((node, container) => {
  const host = container as RootContainer;
  host._reactRoot = host._reactRoot || createRoot(container);
  const root = host._reactRoot;

  root.render(node);

  return async () => {
    // Let antd's exit animations finish before unmounting.
    await new Promise((resolve) => setTimeout(resolve, 0));
    root.unmount();
  };
});
