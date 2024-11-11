import { Canvas } from "datocms-react-ui";
import { RenderItemFormSidebarPanelCtx } from "datocms-plugin-sdk";
import { useEffect, useMemo, useState } from "react";
import { buildClient } from "@datocms/cma-client-browser";

// The block shape used by the "Copy to clipboard" functionality that gets saved to localStorage
export type DeserializedBlock = { itemId: string; itemTypeId: string };

// Our plugin doesn't necessarily have to be a sidebar; it just has to have ctx.itemToFormValues()
export function Sidebar({ ctx }: { ctx: RenderItemFormSidebarPanelCtx }) {
  if (!ctx.currentUserAccessToken) {
    return <p>Invalid current user access token. Please check permissions.</p>;
  }

  const presetModelId = "TkmnDqFjRZKVmuAmDIh5kg";
  const recordIdToFetch = "UjdCtTJCSJ6i-rwxOZBmUQ";

  const [blocksFromOtherRecord, setBlocksFromOtherRecord] = useState<
    DeserializedBlock[] | null
  >(null);
  const stringifiedBlocks = useMemo(
    () => JSON.stringify(blocksFromOtherRecord, null, 2),
    [blocksFromOtherRecord],
  );

  useEffect(() => {
    (async () => {
      try {
/*        if (ctx.itemType.id !== presetModelId) {
          await ctx.editItem(recordIdToFetch);
        }*/

        // Make sure to only use this plugin with trusted editors, because your API key is exposed to them on the client
        const client = buildClient({
          apiToken: ctx.currentUserAccessToken as string,
        });

        // Different from items.find(); this returns a slightly shape that's easier to use with itemToFormValues()
        const response = await client.items.rawFind(recordIdToFetch, {
          nested: true,
        });

        // Get the actual record from the response
        const { data } = response;
        console.log("Original response", response);

        // Load fields for that item type
        const fields = await ctx.loadItemTypeFields(presetModelId);
        console.log("fields", fields);

        // Now we run that external record through the itemToFormValues() method from the plugin's ctx
        const convertedItem = await ctx.itemToFormValues(data);

        // Extract the blocks that we want
        const blocks = convertedItem["blocks"] as DeserializedBlock[];
        console.log("Converted blocks", blocks);

        setBlocksFromOtherRecord(blocks);
      } catch (error) {
        console.error("Conversion error", error);
      }
    })();
  }, []);

  const handleCopyToClipboard = async () => {
    if (!blocksFromOtherRecord?.length) {
      return;
    }

    try {
      await navigator.clipboard.writeText(stringifiedBlocks);
      await ctx.notice(
        `Successfully copied ${blocksFromOtherRecord.length} blocks.`,
      );
    } catch (error) {
      await ctx.alert(`Error copying blocks: ${error}`);
    }
  };

  return (
    <Canvas ctx={ctx}>
      <h2>Converted block</h2>
      Fetching from record ID{" "}
      <strong>
        <a
          href={`/environments/datocms-support-main-copy-2024-11-11/editor/item_types/${presetModelId}/items/${recordIdToFetch}`}
        >
          {recordIdToFetch}
        </a>
      </strong>
      {blocksFromOtherRecord?.length && (
        <p>
          <a href="#" onClick={handleCopyToClipboard}>
            📋 Copy to clipboard
          </a>
        </p>
      )}
      <h3>Debug</h3>
      {!!stringifiedBlocks ? (
        <code>{stringifiedBlocks}</code>
      ) : (
        <p>Loading...</p>
      )}
    </Canvas>
  );
}
