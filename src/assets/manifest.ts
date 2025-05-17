import type { Texture } from "pixi.js";
import type key_atlas_type from "../../public/assets/sprites/pickups/key.json";
import type legs_run_atlas_type from "../../public/assets/sprites/grunt/legs_run.json";
import type run_atlas_type from "../../public/assets/sprites/grunt/run.json";
import type shield_wooden_run_atlas_type from "../../public/assets/sprites/grunt/shield_wooden_run.json";

export type ObjectManifest = {
  bundles: {
    [B in (typeof manifest)["bundles"][number] as B["name"]]: {
      [A in B["assets"][number] as A["alias"]]: A["src"];
    };
  };
};

type Atlas<T extends { animations: any }> = {
  animations: {
    [A in T["animations"] as keyof T["animations"]]: Texture<any>[];
  };
} & T;

export const manifest = {
  bundles: [
    {
      name: "game",
      assets: [
        { alias: "bg", src: "/assets/sprites/tile_desert.png" },
        {
          alias: "palette",
          src: "/assets/sprites/palette.png" as any as Texture,
        },
        {
          alias: "key_atlas",
          src: "/assets/sprites/pickups/key.json" as any as typeof key_atlas_type,
        },
        { alias: "key", src: "/assets/sprites/pickups/key.png" },
        {
          alias: "legs_run",
          src: "/assets/sprites/grunt/legs_run.json" as any as Atlas<
            typeof legs_run_atlas_type
          >,
        },
        {
          alias: "run",
          src: "/assets/sprites/grunt/run.json" as any as Atlas<
            typeof run_atlas_type
          >,
        },
        {
          alias: "shield_wooden_run",
          src: "/assets/sprites/grunt/shield_wooden_run.json" as any as typeof shield_wooden_run_atlas_type,
        },
      ],
    },
  ],
} as const;
