import { connect, RenderItemFormSidebarPanelCtx } from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import { render } from "./utils/render";
import { Sidebar } from "./components/Sidebar.tsx";

connect({
  itemFormSidebarPanels() {
    return [
      {
        id: "copyBlocksToClipboard",
        label: "Copy Blocks to Clipboard",
        startOpen: true,
      },
    ];
  },

  renderItemFormSidebarPanel(_, ctx: RenderItemFormSidebarPanelCtx) {
    render(<Sidebar ctx={ctx} />);
  },
});
