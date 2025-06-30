import type { Texture } from "pixi.js";
import type key_atlas_type from "../../public/assets/sprites/pickups/key.json";
import type legs_run_atlas_type from "../../public/assets/sprites/grunt/legs_run.json";
import type run_atlas_type from "../../public/assets/sprites/grunt/male/run.json";
import type run_no_shield_atlas_type from "../../public/assets/sprites/grunt/male/run_no_shield.json";
import type growl_atlas_type from "../../public/assets/sprites/grunt/male/growl.json";
import type female_run_atlas_type from "../../public/assets/sprites/grunt/female/run.json";
import type female_run_no_shield_atlas_type from "../../public/assets/sprites/grunt/female/run_no_shield.json";
import type female_growl_atlas_type from "../../public/assets/sprites/grunt/female/growl.json";
import type shield_wooden_run_atlas_type from "../../public/assets/sprites/grunt/shield_wooden_run.json";
import type smoke_puff_atlas_type from "../../public/assets/sprites/fx/smoke_puff.json";
import type male_attack_horizontal_atlas_type from "../../public/assets/sprites/grunt/male/attack_horizontal.json";
import type male_attack_vertical_atlas_type from "../../public/assets/sprites/grunt/male/attack_vertical.json";
import type female_attack_horizontal_atlas_type from "../../public/assets/sprites/grunt/female/attack_horizontal.json";
import type female_attack_vertical_atlas_type from "../../public/assets/sprites/grunt/female/attack_vertical.json";
import type female_punch1_atlas_type from "../../public/assets/sprites/grunt/female/punch1.json";
import type female_punch2_atlas_type from "../../public/assets/sprites/grunt/female/punch2.json";
import type male_punch1_atlas_type from "../../public/assets/sprites/grunt/male/punch1.json";
import type male_punch2_atlas_type from "../../public/assets/sprites/grunt/male/punch2.json";

import { Howl } from "howler";

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
          src: "/assets/sprites/grunt/male/run.json" as any as Atlas<
            typeof run_atlas_type
          >,
        },
        {
          alias: "no_shield_run",
          src: "/assets/sprites/grunt/male/run_no_shield.json" as any as Atlas<
            typeof run_no_shield_atlas_type
          >,
        },
        {
          alias: "growl",
          src: "/assets/sprites/grunt/male/growl.json" as any as Atlas<
            typeof growl_atlas_type
          >,
        },
        {
          alias: "female_run",
          src: "/assets/sprites/grunt/female/run.json" as any as Atlas<
            typeof female_run_atlas_type
          >,
        },
        {
          alias: "female_no_shield_run",
          src: "/assets/sprites/grunt/female/run_no_shield.json" as any as Atlas<
            typeof female_run_no_shield_atlas_type
          >,
        },
        {
          alias: "female_growl",
          src: "/assets/sprites/grunt/female/growl.json" as any as Atlas<
            typeof female_growl_atlas_type
          >,
        },
        {
          alias: "shield_wooden_run",
          src: "/assets/sprites/grunt/shield_wooden_run.json" as any as typeof shield_wooden_run_atlas_type,
        },
        {
          alias: "smoke_puff",
          src: "/assets/sprites/fx/smoke_puff.json" as any as Atlas<
            typeof smoke_puff_atlas_type
          >,
        },
        {
          alias: "male_attack_horizontal",
          src: "/assets/sprites/grunt/male/attack_horizontal.json" as any as Atlas<
            typeof male_attack_horizontal_atlas_type
          >,
        },
        {
          alias: "male_attack_vertical",
          src: "/assets/sprites/grunt/male/attack_vertical.json" as any as Atlas<
            typeof male_attack_vertical_atlas_type
          >,
        },
        {
          alias: "female_attack_horizontal",
          src: "/assets/sprites/grunt/female/attack_horizontal.json" as any as Atlas<
            typeof female_attack_horizontal_atlas_type
          >,
        },
        {
          alias: "female_attack_vertical",
          src: "/assets/sprites/grunt/female/attack_vertical.json" as any as Atlas<
            typeof female_attack_vertical_atlas_type
          >,
        },
        {
          alias: "female_punch1",
          src: "/assets/sprites/grunt/female/punch1.json" as any as Atlas<
            typeof female_punch1_atlas_type
          >,
        },
        {
          alias: "female_punch2",
          src: "/assets/sprites/grunt/female/punch2.json" as any as Atlas<
            typeof female_punch2_atlas_type
          >,
        },

        {
          alias: "male_punch1",
          src: "/assets/sprites/grunt/male/punch1.json" as any as Atlas<
            typeof male_punch1_atlas_type
          >,
        },
        {
          alias: "male_punch2",
          src: "/assets/sprites/grunt/male/punch2.json" as any as Atlas<
            typeof male_punch2_atlas_type
          >,
        },
      ],
    },
  ],
} as const;

export const audio_manifest = {
  footstep: () =>
    new Howl({
      src: ["/assets/sounds/footstep.ogg"],
      loop: false,
      volume: 0.8,
      autoplay: false,
      preload: false,
    }),
  male_growl: () =>
    new Howl({
      src: ["/assets/sounds/grunt/male/growl.ogg"],
      loop: true,
      autoplay: false,
      preload: false,
    }),
  female_growl: () =>
    new Howl({
      src: ["/assets/sounds/grunt/female/growl.ogg"],
      loop: true,
      autoplay: false,
      preload: false,
    }),
};
