import type key_atlas_type from "../../public/assets/key.json";

export type ObjectManifest = {
  bundles: {
    [B in (typeof manifest)["bundles"][number] as B["name"]]: {
      [A in B["assets"][number] as A["alias"]]: A["src"];
    };
  };
};

export const manifest = {
  bundles: [
    {
      name: "game",
      assets: [
        { alias: "bg", src: "/assets/tile_desert.png" },
        {
          alias: "key_atlas",
          src: "/assets/key.json" as any as typeof key_atlas_type,
        },
        { alias: "key", src: "/assets/key.png" },
      ],
    },
  ],
} as const;
